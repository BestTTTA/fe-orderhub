"use client";

import React, { FC, useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";

interface Branch {
  branch_name: string;
  quantity: number;
  has_stock: boolean;
}

interface InventoryItem {
  barcode: string;
  sku: string;
  model_sku: string;
  product_name: string;
  unit_price: number;
  warning_stock_level: number;
  cost: number;
  track_stock_level: string;
  branches: Branch[];
  imageUrl?: string;
}

interface OrderItem {
  product_id: string;
  sku: string;
  model_sku: string;
  product_main_image: string;
  paid_price: string;
  item_price: string;
  fulfillment_sla: string;
}

interface Order {
  marketplace: string;
  order_number: string | number;
  total_price: string;
  payment_method: string;
  items_count: string;
  status: string;
  customer_name: string;
  created_at?: string;
  create_time?: number;
  items: OrderItem[];
}

interface SelectedInventory extends InventoryItem {
  imageUrl: string;
}


const ImageModal: React.FC<{ imageUrl: string; onClose: () => void; }> = ({ imageUrl, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white text-xl hover:text-gray-300"
        >
          &times; Close
        </button>
        <img
          src={imageUrl}
          alt="Product"
          className="max-w-full max-h-[80vh] object-contain"
        />
      </div>
    </div>
  );
};


const sendMessage = async (userId: string, message: string, imageUrl: string) => {
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/line/send_message`, {
      user_id: userId,
      message,
      image_url: imageUrl,
    });
    console.log("Message sent successfully:", response.data);
    alert("Message sent successfully!");
  } catch (error) {
    console.error("Error sending message:", error);
    alert("Failed to send the message.");
  }
};

const ProdcutWithdrawal: React.FC<{
  inventory: InventoryItem;
  branch: Branch;
  onClose: () => void;
}> = ({ inventory, branch, onClose }) => {
  const [quantity, setQuantity] = useState(1);

  const handleWithdraw = () => {
    const message = `Sku: ${inventory.sku} จำนวน ${quantity} ชิ้น จากสาขา ${branch.branch_name}`;
    sendMessage("U211d29677d7bf46709126412b1c66c08", message, inventory.imageUrl || "");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-11/12 max-w-lg">
        <h2 className="text-2xl font-bold mb-4">เบิกสินค้า</h2>
        <center>
          <img
            src={inventory.imageUrl}
            alt={inventory.sku}
            className="w-46 h-46 object-cover cursor-pointer hover:opacity-80"
          />
        </center>
        <div className="mb-4">
          <strong>ชื่อสินค้า:</strong> {inventory.product_name}
        </div>
        <div className="mb-4">
          <strong>สาขา:</strong> {branch.branch_name}
        </div>
        <div className="mb-4">
          <label>
            <strong>จำนวน:</strong>
            <input
              type="number"
              value={quantity}
              min={1}
              max={branch.quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="ml-2 border rounded px-2 py-1"
            />
          </label>
        </div>
        <button
          onClick={handleWithdraw}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          ยืนยันการเบิก
        </button>
        <button
          onClick={onClose}
          className="ml-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          ยกเลิก
        </button>
      </div>
    </div>
  );
};


const InventoryModal: React.FC<{ inventory: InventoryItem; onClose: () => void }> = ({
  inventory,
  onClose,
}) => {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-11/12 max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">คลังสินค้า</h2>
          <button
            onClick={onClose}
            className="text-black hover:text-gray-800 text-2xl"
          >
            &times;
          </button>
        </div>

        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">สาขา</th>
              <th className="border p-2">จำนวนชิ้นที่สามารถเบิกได้ (ชิ้น)</th>
              <th className="border p-2"></th>
            </tr>
          </thead>
          <tbody>
            {inventory.branches.map((branch, index) => (
              <tr
                key={index}
                className={branch.has_stock ? "bg-green-50" : "bg-red-50"}
              >
                <td className="border p-2">{branch.branch_name}</td>
                <td className="border p-2 text-center">{branch.quantity}</td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => setSelectedBranch(branch)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded"
                  >
                    เบิกสินค้า
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selectedBranch && (
          <ProdcutWithdrawal
            inventory={inventory}
            branch={selectedBranch}
            onClose={() => setSelectedBranch(null)}
          />
        )}
      </div>
    </div>
  );
};


const EmptyInventoryModal: React.FC<{ sku: string; onClose: () => void; }> = ({ sku, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">ไม่พบข้อมูล</h2>
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-700 text-2xl"
          >
            &times;
          </button>
        </div>
        <p className="mb-4">SKU: {sku}</p>
        <div className="text-center">
          <button
            onClick={onClose}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};



const Editable: FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInventory, setSelectedInventory] = useState<SelectedInventory | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [emptyInventory, setEmptyInventory] = useState<string | null>(null);

  const sortOrders = (orders: Order[]): Order[] => {
    return [...orders].sort((a, b) => {
      const timeA = a.create_time || new Date(a.created_at || '').getTime() / 1000;
      const timeB = b.create_time || new Date(b.created_at || '').getTime() / 1000;

      if (timeA !== timeB) {
        return timeB - timeA;
      }

      const orderNumA = typeof a.order_number === 'string' ?
        parseInt(a.order_number.replace(/\D/g, '')) :
        Number(a.order_number);
      const orderNumB = typeof b.order_number === 'string' ?
        parseInt(b.order_number.replace(/\D/g, '')) :
        Number(b.order_number);

      return orderNumB - orderNumA;
    });
  };

  const areOrdersEqual = (prevOrders: Order[], newOrders: Order[]): boolean => {
    if (prevOrders.length !== newOrders.length) return false;

    return prevOrders.every((prevOrder, index) => {
      const newOrder = newOrders[index];
      return prevOrder.order_number === newOrder.order_number &&
        prevOrder.status === newOrder.status;
    });
  };

  const fetchOrders = async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/marketplace/get_all_orders`);
      const newOrders = sortOrders(response.data.orders);

      setOrders(prevOrders => {
        if (!areOrdersEqual(prevOrders, newOrders)) {
          return newOrders;
        }
        return prevOrders;
      });

      setLoading(false);
    } catch (err) {
      setError('Failed to fetch orders');
      setLoading(false);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders(true);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchOrders(false);
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const handleManualRefresh = () => {
    fetchOrders(true);
  };

  const [check, setCheck] = useState<boolean>(false)
  const checkInventory = async (sku: string, modelSku: string, image_url: string) => {
    setCheck(true)
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/storehub/inventory_check`, {
        params: { sku, model_sku: modelSku },
      });
      if (response.data.inventory && response.data.inventory.length > 0) {
        setSelectedInventory({
          ...response.data.inventory[0],
          imageUrl: image_url
        });

      } else {
        setEmptyInventory(sku);
      }
    } catch (err) {
      console.error('Failed to fetch inventory', err);
      setEmptyInventory(sku);
    } finally {
      setCheck(false);
    }
  };

  const closeInventoryModal = () => {
    setSelectedInventory(null);
  };

  const closeEmptyInventoryModal = () => {
    setEmptyInventory(null);
  };

  const formatDateTime = (dateStr: string | number | undefined) => {
    if (!dateStr) return '';
    if (typeof dateStr === 'number') {
      return new Date(dateStr * 1000).toLocaleString('th-TH');
    }
    return new Date(dateStr).toLocaleString('th-TH');
  };

  if (loading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <Image src="/logo/single_logo.png" alt="Logo" width={200} height={200} className="animate-bounce" />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!orders || orders.length === 0) {
    return (
      <div>
        <div className="w-full bg-black p-4 flex justify-between items-center">
          <Image src="/logo/new_logo.svg" alt="Logo" width={120} height={120} />
          <button
            onClick={handleManualRefresh}
            className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200"
          >
            Refresh
          </button>
        </div>
        <div className="w-full h-[calc(100vh-88px)] flex justify-center items-center">
          <div className="text-2xl font-bold text-gray-600">ไม่พบข้อออเดอร์</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="w-full bg-black p-4 flex justify-between items-center">
        <Image src="/logo/new_logo.svg" alt="Logo" width={120} height={120} />
        <button
          onClick={handleManualRefresh}
          className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200"
        >
          Refresh
        </button>
      </div>
      <div className="overflow-x-auto p-4 flex">
        <table className="w-full h-full">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 border-gray-300">Platform</th>
              <th className="border p-2 border-gray-300">หมายเลขออเดอร์</th>
              <th className="border p-2 border-gray-300">ราคารวม</th>
              <th className="border p-2 border-gray-300">วิธีการชำระเงิน</th>
              <th className="border p-2 border-gray-300">จำนวนสินค้า(ชิ้น)</th>
              <th className="border p-2 border-gray-300">สถานะ</th>
              <th className="border p-2 border-gray-300">ชื่อผู้สั่ง</th>
              <th className="border p-2 border-gray-300">เวลาดำเนินการ</th>
            </tr>
          </thead>
          <tbody className="h-full">
            {orders.map((order, orderIndex) => (
              <React.Fragment key={orderIndex}>
                <tr className="bg-gray-100">
                  <td className="border p-2">{order.marketplace}</td>
                  <td className="border p-2 text-orange-600 font-extrabold">{order.order_number}</td>
                  <td className="border p-2">{order.total_price}</td>
                  <td className="border p-2">{order.payment_method}</td>
                  <td className="border p-2">{order.items_count}</td>
                  <td className="border p-2">{order.status}</td>
                  <td className="border p-2">{order.customer_name}</td>
                  <td className="border p-2">
                    {formatDateTime(order.created_at || order.create_time)}
                  </td>
                </tr>
                {order.items.map((item, itemIndex, itemsArray) => (
                  <tr
                    key={`${orderIndex}-${itemIndex}`}
                    className={`hover:bg-gray-50 h-full ${itemIndex === itemsArray.length - 1 && orderIndex !== orders.length - 1 ? 'border-b-8 border-white' : ''}`}
                  >
                    <td colSpan={2} className="border p-2 pl-6 bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <img
                          src={item.product_main_image}
                          alt={item.sku}
                          className="w-16 h-16 object-cover cursor-pointer hover:opacity-80"
                          onClick={() => setSelectedImage(item.product_main_image)}
                        />
                        <div>
                          <div><strong>SKU:</strong> {item.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td colSpan={2} className="border p-2 bg-gray-50">
                      <div className="font-extrabold"><strong>ราคาซื้อ:</strong> {item.paid_price} บาท</div>
                      <div className="text-[11px]">ราคาสินค้า: {item.item_price} บาท</div>
                    </td>
                    <td colSpan={3} className="border p-2 bg-gray-50 text-red-500">
                      <strong>กำหนดส่งสินค้า:</strong> {item.fulfillment_sla}
                    </td>
                    <td className="p-2 bg-gray-50 flex items-center h-full justify-center">
                      {!check ? (
                        <button
                          onClick={() => checkInventory(item.sku, item.model_sku, item.product_main_image)}
                          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 w-full"
                        >
                          ตรวจสอบคลังสินค้า
                        </button>
                      ) : (
                        <button
                          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 w-full"
                          disabled
                        >
                          Loading...
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {selectedInventory && (
        <InventoryModal
          inventory={selectedInventory}
          onClose={closeInventoryModal}
        />
      )}

      {emptyInventory && (
        <EmptyInventoryModal
          sku={emptyInventory}
          onClose={closeEmptyInventoryModal}
        />
      )}

      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};

export default Editable;