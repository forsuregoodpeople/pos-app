import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, Wrench } from "lucide-react";
import { Transaction } from "@/hooks/useTransaction";

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

export const TransactionDetailModal = ({ transaction, isOpen, onClose }: TransactionDetailModalProps) => {
  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Transaksi</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm text-gray-600">No. Invoice</p>
                <p className="font-semibold">{transaction.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(transaction.total)}</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p>Tanggal: {formatDate(transaction.savedAt)}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div>
            <h3 className="font-semibold mb-3">Informasi Pelanggan</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nama</p>
                  <p className="font-medium">{transaction.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tipe</p>
                  <p className="font-medium capitalize">{transaction.customer.tipe || 'Umum'}</p>
                </div>
                {transaction.customer.phone && (
                  <div>
                    <p className="text-sm text-gray-600">Telepon</p>
                    <p className="font-medium">{transaction.customer.phone}</p>
                  </div>
                )}
                {transaction.customer.platNomor && (
                  <div>
                    <p className="text-sm text-gray-600">Plat Nomor</p>
                    <p className="font-medium">{transaction.customer.platNomor}</p>
                  </div>
                )}
                {transaction.customer.mobil && (
                  <div>
                    <p className="text-sm text-gray-600">Mobil</p>
                    <p className="font-medium">{transaction.customer.mobil}</p>
                  </div>
                )}
                {transaction.customer.mekanik && (
                  <div>
                    <p className="text-sm text-gray-600">Mekanik</p>
                    <p className="font-medium">{transaction.customer.mekanik}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mechanics Section */}
          {transaction.customer.mekaniks && transaction.customer.mekaniks.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Mekanik & Persentase Kerja
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {transaction.customer.mekaniks.map((mekanik, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{mekanik.name}</p>
                          <p className="text-sm text-gray-500">Mekanik</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{mekanik.percentage}%</p>
                        <p className="text-xs text-gray-500">Komisi</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Total Persentase:</span>
                    <span className="text-lg font-bold text-gray-900">
                      {transaction.customer.mekaniks.reduce((sum, m) => sum + m.percentage, 0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Items Detail - Separated by Type */}
          <div>
            <h3 className="font-semibold mb-3">Detail Barang & Jasa</h3>
            
            {/* Services Section */}
            {transaction.items.filter(item => item.type === 'service').length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-blue-600 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Jasa
                </h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-blue-50">
                       <tr>
                         <th className="px-4 py-2 text-left text-sm font-medium text-blue-700">Nama Jasa</th>
                         <th className="px-4 py-2 text-center text-sm font-medium text-blue-700">Qty</th>
                         <th className="px-4 py-2 text-right text-sm font-medium text-blue-700">Harga</th>
                         <th className="px-4 py-2 text-center text-sm font-medium text-blue-700">Diskon</th>
                         <th className="px-4 py-2 text-right text-sm font-medium text-blue-700">Subtotal</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y">
                       {transaction.items.filter(item => item.type === 'service').map((item, index) => (
                          <tr key={`service-${index}`}>
                            <td className="px-4 py-3">
                              <p className="font-medium">{item.name}</p>
                            </td>
                            <td className="px-4 py-3 text-center">{item.qty}</td>
                            <td className="px-4 py-3 text-right">{formatCurrency(item.price)}</td>
                            <td className="px-4 py-3 text-center">
                              {(item as any).discount ? `${(item as any).discount}` : '-'}
                            </td>
                            <td className="px-4 py-3 text-right font-medium">
                              {formatCurrency((item.price * item.qty) - ((item as any).discount || 0))}
                            </td>
                          </tr>
                       ))}
                    </tbody>
                    <tfoot className="bg-blue-50">
                       <tr>
                         <td colSpan={4} className="px-4 py-3 text-right font-semibold text-blue-700">
                           Subtotal Jasa:
                         </td>
                         <td className="px-4 py-3 text-right font-bold text-blue-600">
                            {formatCurrency(
                              transaction.items
                                .filter(item => item.type === 'service')
                                .reduce((sum, item) => sum + ((item.price * item.qty) - ((item as any).discount || 0)), 0)
                            )}
                         </td>
                       </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Parts Section */}
            {transaction.items.filter(item => item.type === 'part').length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-green-600 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Barang/Sparepart
                </h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-green-50">
                       <tr>
                         <th className="px-4 py-2 text-left text-sm font-medium text-green-700">Nama Barang</th>
                         <th className="px-4 py-2 text-center text-sm font-medium text-green-700">Qty</th>
                         <th className="px-4 py-2 text-right text-sm font-medium text-green-700">Harga</th>
                         <th className="px-4 py-2 text-center text-sm font-medium text-green-700">Diskon</th>
                         <th className="px-4 py-2 text-right text-sm font-medium text-green-700">Subtotal</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y">
                       {transaction.items.filter(item => item.type === 'part').map((item, index) => (
                          <tr key={`part-${index}`}>
                            <td className="px-4 py-3">
                              <p className="font-medium">{item.name}</p>
                            </td>
                            <td className="px-4 py-3 text-center">{item.qty}</td>
                            <td className="px-4 py-3 text-right">{formatCurrency(item.price)}</td>
                            <td className="px-4 py-3 text-center">
                              {(item as any).discount ? `${(item as any).discount}` : '-'}
                            </td>
                            <td className="px-4 py-3 text-right font-medium">
                              {formatCurrency((item.price * item.qty) - ((item as any).discount || 0))}
                            </td>
                          </tr>
                       ))}
                    </tbody>
                    <tfoot className="bg-green-50">
                       <tr>
                         <td colSpan={4} className="px-4 py-3 text-right font-semibold text-green-700">
                           Subtotal Barang:
                         </td>
                         <td className="px-4 py-3 text-right font-bold text-green-600">
                            {formatCurrency(
                              transaction.items
                                .filter(item => item.type === 'part')
                                .reduce((sum, item) => sum + ((item.price * item.qty) - ((item as any).discount || 0)), 0)
                            )}
                         </td>
                       </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

             {/* PPN and Biaya Lain */}
             <div className="bg-gray-50 rounded-lg p-4 space-y-2">
               <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">
                  {formatCurrency(
                    transaction.items.reduce((sum, item) => sum + ((item.price * item.qty) - ((item as any).discount || 0)), 0)
                  )}
                </span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-600">PPN (11%):</span>
                 <span className="font-medium">
                   {formatCurrency(((transaction as any).total * 11) / 109)}
                 </span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-600">Biaya Lain:</span>
                 <span className="font-medium">
                   {formatCurrency((transaction as any).biayaLain || 0)}
                 </span>
               </div>
             </div>

             {/* Grand Total */}
             <div className="bg-gray-100 rounded-lg p-4">
               <div className="flex justify-between items-center">
                 <span className="text-lg font-semibold text-gray-700">Grand Total:</span>
                 <span className="text-2xl font-bold text-blue-600">
                   {formatCurrency(transaction.total)}
                 </span>
               </div>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};