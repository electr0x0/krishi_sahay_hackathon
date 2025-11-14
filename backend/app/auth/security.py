from datetime import datetime, timedelta
from typing import Optional
import hashlib
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from app.core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

# Password hashing - lazy initialization to avoid bcrypt init issues
_pwd_context = None

def _get_pwd_context():
    """Get password context with lazy initialization"""
    global _pwd_context
    if _pwd_context is None:
        # Use pbkdf2_sha256 as primary to avoid bcrypt initialization issues
        # pbkdf2_sha256 is secure and doesn't have the 72-byte limit or init bugs
        _pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")
    return _pwd_context

def _prepare_password(password: str) -> str:
    """
    Prepare password for bcrypt hashing.
    Bcrypt has a 72-byte limit, so we pre-hash longer passwords with SHA256.
    """
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        # Pre-hash with SHA256 to ensure it fits in bcrypt's 72-byte limit
        return hashlib.sha256(password_bytes).hexdigest()
    return password

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash"""
    if not hashed_password:
        return False
    try:
        pwd_context = _get_pwd_context()
        # Try normal verification first
        if pwd_context.verify(plain_password, hashed_password):
            return True
        
        # If that fails and password is long, try with pre-hashed version
        prepared_password = _prepare_password(plain_password)
        if prepared_password != plain_password:
            return pwd_context.verify(prepared_password, hashed_password)
        
        return False
    except Exception:
        # Handle cases where hash is invalid, corrupted, or in unrecognized format
        return False

def get_password_hash(password: str) -> str:
    """Generate password hash"""
    pwd_context = _get_pwd_context()
    # Prepare password (pre-hash if longer than 72 bytes)
    prepared_password = _prepare_password(password)
    try:
        return pwd_context.hash(prepared_password)
    except (ValueError, AttributeError) as e:
        # If bcrypt fails (e.g., due to initialization bug), force pbkdf2_sha256
        if "bcrypt" in str(e).lower() or "72 bytes" in str(e).lower():
            fallback_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
            return fallback_context.hash(prepared_password)
        raise

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> dict:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def create_refresh_token(data: dict) -> str:
    """Create refresh token (longer expiry)"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)  # 7 days for refresh token
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)