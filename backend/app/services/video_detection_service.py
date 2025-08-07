import cv2
import numpy as np
import os
import tempfile
import subprocess
import threading
from typing import Generator, Dict, List, Tuple, Optional
from ultralytics import YOLO
import logging
import time
from .detection_service import PlantDiseaseDetector

logger = logging.getLogger(__name__)

class VideoPlantDiseaseDetector(PlantDiseaseDetector):
    """Extended detector for video and real-time processing"""
    
    def __init__(self, model_path: str, conf_threshold: float = 0.25):
        super().__init__(model_path, conf_threshold)
        self.is_processing = False
        self.stop_processing = False
        
    def _convert_to_browser_compatible(self, input_path: str, output_path: str) -> bool:
        """
        Convert video to browser-compatible H.264 MP4 format using FFmpeg
        """
        try:
            # Create temporary output path
            temp_output = output_path + "_temp.mp4"
            
            # FFmpeg command for browser-compatible video
            cmd = [
                'ffmpeg',
                '-i', input_path,
                '-c:v', 'libx264',  # H.264 codec
                '-preset', 'medium',  # Balanced speed/quality
                '-crf', '23',  # Good quality
                '-c:a', 'aac',  # AAC audio codec
                '-movflags', '+faststart',  # Web optimization
                '-pix_fmt', 'yuv420p',  # Compatible pixel format
                '-y',  # Overwrite output
                temp_output
            ]
            
            # Run FFmpeg
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            
            if result.returncode == 0:
                # Replace original with converted version
                os.replace(temp_output, output_path)
                logger.info(f"Successfully converted video to browser-compatible format")
                return True
            else:
                logger.error(f"FFmpeg conversion failed: {result.stderr}")
                # Clean up temp file if it exists
                if os.path.exists(temp_output):
                    os.remove(temp_output)
                return False
                
        except subprocess.TimeoutExpired:
            logger.error("FFmpeg conversion timed out")
            return False
        except FileNotFoundError:
            logger.warning("FFmpeg not found - using OpenCV output as-is")
            return False
        except Exception as e:
            logger.error(f"Error during video conversion: {str(e)}")
            return False

    def process_video_file(self, video_path: str, output_path: str, frame_skip: int = 5) -> Generator[Dict, None, None]:
        """
        Process a video file frame by frame with disease detection.
        
        Args:
            video_path: Path to input video file
            output_path: Path to save processed video
            frame_skip: Process every nth frame for efficiency
            
        Yields:
            Progress updates with detection results
        """
        self.is_processing = True
        self.stop_processing = False
        
        try:
            # Open video file
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                raise ValueError(f"Could not open video file: {video_path}")
            
            # Get video properties
            fps = int(cap.get(cv2.CAP_PROP_FPS))
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            
            # Setup video writer with H.264 codec for better browser compatibility
            # Try different codecs in order of preference
            codecs_to_try = [
                ('H264', 'H.264 - best browser compatibility'),
                ('avc1', 'H.264 alternative'),  
                ('mp4v', 'MPEG-4 fallback'),
                ('MJPG', 'Motion JPEG fallback')
            ]
            
            out = None
            used_codec = None
            for codec, description in codecs_to_try:
                try:
                    fourcc = cv2.VideoWriter_fourcc(*codec)
                    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
                    # Test if the writer was successfully created
                    if out.isOpened():
                        used_codec = codec
                        logger.info(f"Using codec: {codec} ({description})")
                        break
                    else:
                        out.release()
                        out = None
                except Exception as e:
                    if out:
                        out.release()
                        out = None
                    logger.debug(f"Codec {codec} failed: {str(e)}")
                    continue
            
            if not out or not out.isOpened():
                raise ValueError("Could not initialize video writer with any supported codec")
            
            frame_count = 0
            processed_frames = 0
            detection_history = []
            
            yield {
                "status": "started",
                "total_frames": total_frames,
                "fps": fps,
                "dimensions": (width, height)
            }
            
            while cap.isOpened() and not self.stop_processing:
                ret, frame = cap.read()
                if not ret:
                    break
                
                frame_count += 1
                
                # Process every nth frame for efficiency
                if frame_count % frame_skip == 0:
                    processed_frames += 1
                    
                    # Save frame temporarily for detection
                    with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_file:
                        cv2.imwrite(temp_file.name, frame)
                        
                        # Run detection
                        try:
                            processed_frame, detections = self.predict(temp_file.name)
                            
                            # Store detection results
                            frame_data = {
                                "frame_number": frame_count,
                                "timestamp": frame_count / fps,
                                "detections": detections,
                                "detection_count": len(detections)
                            }
                            detection_history.append(frame_data)
                            
                            # Write processed frame
                            out.write(processed_frame)
                            
                            # Yield progress update
                            yield {
                                "status": "processing",
                                "frame_number": frame_count,
                                "processed_frames": processed_frames,
                                "total_frames": total_frames,
                                "progress": (frame_count / total_frames) * 100,
                                "current_detections": detections,
                                "detection_count": len(detections)
                            }
                            
                        except Exception as e:
                            logger.error(f"Error processing frame {frame_count}: {str(e)}")
                            out.write(frame)  # Write original frame on error
                        
                        finally:
                            # Clean up temp file safely
                            try:
                                os.unlink(temp_file.name)
                            except (OSError, PermissionError) as e:
                                logger.warning(f"Could not delete temp file {temp_file.name}: {str(e)}")
                else:
                    # Write original frame without processing
                    out.write(frame)
            
            # Cleanup
            cap.release()
            out.release()
            
            # Convert to browser-compatible format
            conversion_successful = self._convert_to_browser_compatible(output_path, output_path)
            
            # Final summary
            yield {
                "status": "completed",
                "total_frames": total_frames,
                "processed_frames": processed_frames,
                "output_path": output_path,
                "detection_history": detection_history,
                "total_detections": sum(len(frame["detections"]) for frame in detection_history),
                "browser_compatible": conversion_successful,
                "codec_used": used_codec
            }
            
        except Exception as e:
            logger.error(f"Error in video processing: {str(e)}")
            yield {
                "status": "error",
                "error": str(e)
            }
        finally:
            self.is_processing = False
    
    def process_realtime_stream(self, camera_index: int = 0) -> Generator[Dict, None, None]:
        """
        Process real-time camera stream with disease detection.
        
        Args:
            camera_index: Camera device index (0 for default camera)
            
        Yields:
            Real-time detection results
        """
        self.is_processing = True
        self.stop_processing = False
        
        try:
            # Open camera
            cap = cv2.VideoCapture(camera_index)
            if not cap.isOpened():
                raise ValueError(f"Could not open camera {camera_index}")
            
            # Set camera properties
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            cap.set(cv2.CAP_PROP_FPS, 30)
            
            frame_count = 0
            last_detection_time = 0
            detection_interval = 1.0  # Detect every 1 second
            
            yield {
                "status": "stream_started",
                "camera_index": camera_index
            }
            
            while cap.isOpened() and not self.stop_processing:
                ret, frame = cap.read()
                if not ret:
                    break
                
                frame_count += 1
                current_time = time.time()
                
                # Only run detection at intervals to reduce load
                if current_time - last_detection_time >= detection_interval:
                    last_detection_time = current_time
                    
                    # Save frame temporarily for detection
                    with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_file:
                        cv2.imwrite(temp_file.name, frame)
                        
                        try:
                            processed_frame, detections = self.predict(temp_file.name)
                            
                            # Convert frame to base64 for transmission
                            _, buffer = cv2.imencode('.jpg', processed_frame)
                            frame_b64 = buffer.tobytes()
                            
                            yield {
                                "status": "detection",
                                "frame_number": frame_count,
                                "timestamp": current_time,
                                "detections": detections,
                                "detection_count": len(detections),
                                "frame_data": frame_b64
                            }
                            
                        except Exception as e:
                            logger.error(f"Error in real-time detection: {str(e)}")
                            # Send original frame on error
                            _, buffer = cv2.imencode('.jpg', frame)
                            frame_b64 = buffer.tobytes()
                            
                            yield {
                                "status": "detection",
                                "frame_number": frame_count,
                                "timestamp": current_time,
                                "detections": [],
                                "detection_count": 0,
                                "frame_data": frame_b64,
                                "error": str(e)
                            }
                        
                        finally:
                            # Clean up temp file safely
                            try:
                                os.unlink(temp_file.name)
                            except (OSError, PermissionError) as e:
                                logger.warning(f"Could not delete temp file {temp_file.name}: {str(e)}")
                
                # Small delay to prevent overwhelming the system
                time.sleep(0.033)  # ~30 FPS
            
        except Exception as e:
            logger.error(f"Error in real-time stream: {str(e)}")
            yield {
                "status": "error",
                "error": str(e)
            }
        finally:
            if 'cap' in locals():
                cap.release()
            self.is_processing = False
    
    def stop_stream(self):
        """Stop the current processing stream"""
        self.stop_processing = True
    
    def process_frame_from_bytes(self, frame_bytes: bytes) -> Tuple[bytes, List[Dict]]:
        """
        Process a single frame from bytes (for camera snapshots).
        
        Args:
            frame_bytes: Image data as bytes
            
        Returns:
            Processed frame as bytes and detection results
        """
        try:
            # Convert bytes to numpy array
            nparr = np.frombuffer(frame_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is None:
                raise ValueError("Invalid image data")
            
            # Save temporarily for detection
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_file:
                cv2.imwrite(temp_file.name, frame)
                
                try:
                    processed_frame, detections = self.predict(temp_file.name)
                    
                    # Convert back to bytes
                    _, buffer = cv2.imencode('.jpg', processed_frame)
                    processed_bytes = buffer.tobytes()
                    
                    return processed_bytes, detections
                    
                finally:
                    # Clean up temp file safely
                    try:
                        os.unlink(temp_file.name)
                    except (OSError, PermissionError) as e:
                        logger.warning(f"Could not delete temp file {temp_file.name}: {str(e)}")
                    
        except Exception as e:
            logger.error(f"Error processing frame from bytes: {str(e)}")
            raise
