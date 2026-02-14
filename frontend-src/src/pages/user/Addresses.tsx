import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuthStore, useAddressStore } from '@/store';
import api from '@/api';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Phone,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import type { DeliveryAddress } from '@/types';

export default function Addresses() {
  const { user } = useAuthStore();
  const { addresses, setAddresses, addAddress, updateAddress, removeAddress, setDefaultAddress } = useAddressStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    address: '',
    isDefault: false,
  });

  // 获取地址列表
  const { isLoading } = useQuery({
    queryKey: ['addresses', user?.id],
    queryFn: async () => {
      const data = await api.addresses.getAll();
      setAddresses(data);
      if (data.find((a: any) => a.isDefault)) {
        setDefaultAddress(data.find((a: any) => a.isDefault) || null);
      }
      return data;
    },
    enabled: !!user
  });

  // 创建地址
  const createMutation = useMutation({
    mutationFn: (data: Partial<DeliveryAddress>) => api.addresses.create(data),
    onSuccess: (data: any) => {
      addAddress(data);
      toast.success('地址添加成功');
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error('添加失败，请重试');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      address: '',
      isDefault: false,
    });
    setEditingAddress(null);
  };

  const handleOpenDialog = (address?: DeliveryAddress) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        name: address.name,
        phone: address.phone,
        province: address.province,
        city: address.city,
        district: address.district,
        address: address.address,
        isDefault: address.isDefault,
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    // 简单验证
    if (!formData.name || !formData.phone || !formData.address) {
      toast.error('请填写完整信息');
      return;
    }

    if (editingAddress) {
      // 更新地址
      const updated = { ...editingAddress, ...formData };
      updateAddress(updated);
      toast.success('地址更新成功');
      setDialogOpen(false);
      resetForm();
    } else {
      // 创建地址
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个地址吗？')) {
      removeAddress(id);
      toast.success('地址已删除');
    }
  };

  const handleSetDefault = (address: DeliveryAddress) => {
    const updated = { ...address, isDefault: true };
    updateAddress(updated);
    setDefaultAddress(updated);
    // 更新其他地址为非默认
    addresses.filter(a => a.id !== address.id && a.isDefault).forEach(a => {
      updateAddress({ ...a, isDefault: false });
    });
    toast.success('默认地址已设置');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      {/* 页面标题 */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">收货地址</h1>
          <p className="text-gray-500">管理您的配送地址</p>
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={() => handleOpenDialog()}
        >
          <Plus className="w-4 h-4 mr-2" />
          添加地址
        </Button>
      </div>

      {/* 地址列表 */}
      {addresses.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">暂无收货地址</h2>
          <p className="text-gray-500 mb-6">添加地址以便快速下单</p>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => handleOpenDialog()}
          >
            <Plus className="w-4 h-4 mr-2" />
            添加地址
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <Card
              key={address.id}
              className={`relative overflow-hidden ${
                address.isDefault ? 'ring-2 ring-green-500' : ''
              }`}
            >
              {address.isDefault && (
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-bl-lg">
                  默认
                </div>
              )}
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{address.name}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{address.phone}</span>
                </div>
                <div className="flex items-start space-x-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <div>{address.province} {address.city} {address.district}</div>
                    <div className="text-gray-900 font-medium">{address.address}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center space-x-2">
                    {!address.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500"
                        onClick={() => handleSetDefault(address)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        设为默认
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500"
                      onClick={() => handleOpenDialog(address)}
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      编辑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(address.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      删除
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 添加/编辑地址对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? '编辑地址' : '添加地址'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>收货人姓名</Label>
              <Input
                placeholder="请输入姓名"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>手机号码</Label>
              <Input
                placeholder="请输入手机号"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2">
                <Label>省</Label>
                <Input
                  placeholder="省"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>市</Label>
                <Input
                  placeholder="市"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>区</Label>
                <Input
                  placeholder="区"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>详细地址</Label>
              <Input
                placeholder="请输入详细地址"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isDefault" className="cursor-pointer">
                设为默认地址
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleSubmit}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
              ) : null}
              {editingAddress ? '保存' : '添加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
