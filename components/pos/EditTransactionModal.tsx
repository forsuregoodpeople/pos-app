import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Receipt, Calendar, Car, Phone, Package, Wrench } from "lucide-react";
import { Transaction } from "@/hooks/useTransaction";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onSelectTransaction: (transaction: Transaction) => void;
}

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

const formatPhoneNumber = (phone: string) => {
  if (!phone) return "-";
  return phone.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3");
};

const getCustomerTypeBadge = (type: string) => {
  const config = {
    umum: { label: "Umum", color: "bg-blue-100 text-blue-800" },
    perusahaan: { label: "Perusahaan", color: "bg-purple-100 text-purple-800" }
  };
  const item = config[type as keyof typeof config] || config.umum;
  return (
    <Badge variant="secondary" className={`text-xs font-medium ${item.color} border-0`}>
      {item.label}
    </Badge>
  );
};

const getGroupedItems = (transaction: Transaction) => {
  const services = transaction.items.filter(item => item.type === "service");
  const parts = transaction.items.filter(item => item.type === "part");
  
  return {
    services: {
      count: services.length,
      totalQty: services.reduce((total, item) => total + item.qty, 0),
      items: services
    },
    parts: {
      count: parts.length,
      totalQty: parts.reduce((total, item) => total + item.qty, 0),
      items: parts
    }
  };
};

export const EditTransactionModal = ({ 
  isOpen, 
  onClose, 
  transactions, 
  onSelectTransaction 
}: EditTransactionModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredTransactions = transactions.filter(transaction => 
    transaction.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.customer.platNomor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.customer.phone?.includes(searchQuery)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Pilih Transaksi untuk Diedit</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-full">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Cari nomor invoice, nama, plat nomor, atau telepon..."
            />
          </div>

          {/* Transaction List */}
          <div className="flex-1 overflow-y-auto">
            {filteredTransactions.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-gray-500">
                <div className="text-center">
                  <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">
                    {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada transaksi"}
                  </p>
                  <p className="text-xs mt-1">
                    {searchQuery ? "Coba kata kunci lain" : "Transaksi akan muncul di sini"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((transaction, index) => (
                  <div
                    key={`${transaction.invoiceNumber}-${index}`}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onSelectTransaction(transaction)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Receipt className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="font-semibold text-gray-900 truncate">
                            {transaction.invoiceNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(transaction.savedAt)}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-blue-700">
                          Rp {transaction.total.toLocaleString('id-ID')}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {getCustomerTypeBadge(transaction.customer.tipe)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-blue-700">
                              {transaction.customer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {transaction.customer.name}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{formatPhoneNumber(transaction.customer.phone)}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.customer.mobil || '-'}
                            </div>
                            <div className="text-xs text-gray-600 font-mono">
                              {transaction.customer.platNomor || '-'}
                            </div>
                          </div>
                        </div>
                        {transaction.customer.kmMasuk && (
                          <div className="text-xs text-gray-500">
                            KM: {transaction.customer.kmMasuk}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      {(() => {
                        const grouped = getGroupedItems(transaction);
                        return (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5">
                                <Wrench className="w-4 h-4 text-blue-500" />
                                <span className="text-sm text-gray-600">
                                  Jasa: {grouped.services.count}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Package className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-gray-600">
                                  Barang: {grouped.parts.count}
                                </span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectTransaction(transaction);
                              }}
                            >
                              Pilih
                            </Button>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="w-full">
              Batal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};