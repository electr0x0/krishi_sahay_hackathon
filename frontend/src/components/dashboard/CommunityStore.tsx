'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlusCircle, ListPlus, Building, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const CommunityStore = ({ communityId }) => {
  const [myProducts, setMyProducts] = useState([]);
  const [communityListings, setCommunityListings] = useState([]);
  const [showListingForm, setShowListingForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newListing, setNewListing] = useState({
    price: '',
    stock_qty: '',
    location: '',
  });
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchMyProducts();
    fetchCommunityListings();
  }, [communityId]);

  const fetchMyProducts = async () => {
    try {
      const products = await api.getMyProducts();
      setMyProducts(products);
    } catch (error) {
      console.error("আমার পণ্য আনতে সমস্যা হয়েছে", error);
      setAlert({ type: 'error', message: 'আপনার পণ্যগুলো আনা সম্ভব হয়নি।' });
    }
  };

  const fetchCommunityListings = async () => {
    try {
      const listings = await api.getCommunityListings(communityId);
      setCommunityListings(listings);
    } catch (error) {
      console.error("কমিউনিটি লিস্টিং আনতে সমস্যা হয়েছে", error);
      setAlert({ type: 'error', message: 'কমিউনিটি লিস্টিং আনা সম্ভব হয়নি।' });
    }
  };

  const handleCreateListing = async () => {
    if (!selectedProduct) return;
    try {
      const listingData = {
        ...newListing,
        product_id: selectedProduct.id,
        community_id: communityId,
      };
      await api.createStoreListing(listingData);
      setAlert({ type: 'success', message: 'পণ্যটি কমিউনিটি স্টোরে সফলভাবে যোগ করা হয়েছে!' });
      setShowListingForm(false);
      setSelectedProduct(null);
      fetchCommunityListings(); // Refresh listings
    } catch (error) {
      console.error("Failed to create listing", error);
      setAlert({ type: 'error', message: error.message || 'কমিউনিটি স্টোরে পণ্য যোগ করতে সমস্যা হয়েছে।' });
    }
  };

  const openListingForm = (product) => {
    setSelectedProduct(product);
    setNewListing({ price: '', stock_qty: '', location: '' });
    setShowListingForm(true);
  };

  return (
    <div className="space-y-6">
      {alert && (
        <Alert variant={alert.type === 'error' ? 'destructive' : 'default'}>
          <AlertTitle>{alert.type === 'error' ? 'ত্রুটি' : 'সফল'}</AlertTitle>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Building className="w-6 h-6 text-green-600" />
            <div>
              <CardTitle>কমিউনিটি স্টোর</CardTitle>
              <CardDescription>আপনার নিজের পণ্য কমিউনিটির মাধ্যমে বিক্রি করুন।</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-4">কমিউনিটি স্টোরে যোগ করার জন্য আপনার পণ্য</h3>
          <div className="space-y-3">
            {myProducts.length > 0 ? (
              myProducts.map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <img 
                      src={product.image_url || 'https://via.placeholder.com/64'} 
                      alt={product.name}
                      className="w-16 h-16 rounded-md object-cover"
                    />
                    <div>
                      <h4 className="font-bold">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.category} ({product.unit})</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => openListingForm(product)}>
                    <ListPlus className="w-4 h-4 mr-2" />
                    স্টোরে যোগ করুন
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">
                আপনার কোনো পণ্য এখনো যোগ করা হয়নি। <a href="/dashboard/store" className="text-green-600 hover:underline">আমার দোকান</a> -এ গিয়ে পণ্য যোগ করুন।
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {showListingForm && selectedProduct && (
        <Card>
          <CardHeader>
            <CardTitle>"{selectedProduct.name}" স্টোরে যোগ করুন</CardTitle>
            <CardDescription>বিক্রির জন্য মূল্য এবং পরিমাণ নির্ধারণ করুন।</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">মূল্য (প্রতি {selectedProduct.unit})</label>
              <Input id="price" placeholder="মূল্য" type="number" value={newListing.price} onChange={(e) => setNewListing({...newListing, price: e.target.value})} />
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">মজুদের পরিমাণ ({selectedProduct.unit})</label>
              <Input id="stock" placeholder="মজুদ" type="number" value={newListing.stock_qty} onChange={(e) => setNewListing({...newListing, stock_qty: e.target.value})} />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">অবস্থান</label>
              <Input id="location" placeholder="আপনার গ্রাম/এলাকা" value={newListing.location} onChange={(e) => setNewListing({...newListing, location: e.target.value})} />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowListingForm(false)}>বাতিল</Button>
              <Button onClick={handleCreateListing}>
                <PlusCircle className="w-4 h-4 mr-2" />
                লিস্টিং তৈরি করুন
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>বর্তমানে কমিউনিটি স্টোরে আছে</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {communityListings.length > 0 ? (
              communityListings.map(listing => (
                <div key={listing.id} className="border rounded-lg p-4 flex gap-4 bg-white shadow-sm">
                  <img src={listing.product_image_url || 'https://via.placeholder.com/100'} alt={listing.product_name} className="w-24 h-24 rounded-md object-cover"/>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{listing.product_name}</h4>
                    <p className="text-sm text-gray-500">{listing.seller_name}</p>
                    <Badge variant="secondary" className="mt-1">{listing.product_category}</Badge>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xl font-semibold text-green-600">৳{listing.price} <span className="text-sm font-normal text-gray-500">/{listing.unit}</span></p>
                      <Button size="sm">
                        <ShoppingCart className="w-4 h-4 mr-2"/>
                        কিনুন
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4 col-span-full">এই মুহূর্তে কমিউনিটি স্টোরে কোনো পণ্য নেই।</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityStore;
