import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Scan, Search, Check, X, User, QrCode, Plus, Gift, CheckCircle2, Clock, RotateCcw, ChevronRight, Zap } from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';

// --- Types ---
interface LoyaltyProgram {
  id: string;
  name: string;
  progress: number;
  total: number;
  reward: string;
}

interface ScannedCustomer {
  customerId: string;
  name: string;
  phone: string;
  programs: LoyaltyProgram[];
  ts: number;
}

type ScanPhase = 'idle' | 'scanning' | 'success' | 'stamp-added' | 'reward-redeemed';

// --- Mock QR payload (same as CustomerQRCode generates) ---
const MOCK_QR_PAYLOAD = JSON.stringify({
  customerId: 'LY-2024-001847',
  name: 'Ahmed Al-Mansouri',
  phone: '+218912345678',
  programs: [
    { id: 'costa-coffee', name: 'Costa Coffee', progress: 4, total: 8, reward: 'Free Coffee' },
    { id: 'nandos-tripoli', name: "Nando's Tripoli", progress: 7, total: 10, reward: 'Free Meal' },
    { id: 'casper-gambinis', name: "Casper & Gambini's", progress: 2, total: 5, reward: 'Free Dessert' },
  ],
  ts: Date.now(),
});

const recentValidations = [
  { id: 1, customer: 'فاطمة الزهراء', reward: 'Free Coffee', time: '3 min ago', action: 'stamp', program: 'Costa Coffee' },
  { id: 2, customer: 'Omar Khalidi', reward: 'Free Meal', time: '11 min ago', action: 'redeem', program: "Nando's Tripoli" },
  { id: 3, customer: 'Nura Al-Fassi', reward: '+1 Stamp', time: '24 min ago', action: 'stamp', program: 'Costa Coffee' },
  { id: 4, customer: 'Khaled Benali', reward: 'Free Dessert', time: '41 min ago', action: 'redeem', program: "Casper & Gambini's" },
];

export function StaffOperations() {
  const [searchQuery, setSearchQuery] = useState('');
  const [scanPhase, setScanPhase] = useState<ScanPhase>('idle');
  const [scannedCustomer, setScannedCustomer] = useState<ScannedCustomer | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<LoyaltyProgram | null>(null);
  const [actionResult, setActionResult] = useState<{ type: 'stamp' | 'redeem'; program: string } | null>(null);
  const [localValidations, setLocalValidations] = useState(recentValidations);

  // Simulate scanning the QR (parse the mock payload)
  const handleSimulateScan = () => {
    setScanPhase('scanning');
    setTimeout(() => {
      try {
        const data = JSON.parse(MOCK_QR_PAYLOAD) as ScannedCustomer;
        setScannedCustomer(data);
        setSelectedProgram(data.programs[0]);
        setScanPhase('success');
      } catch {
        setScanPhase('idle');
      }
    }, 1800);
  };

  const handleAddStamp = () => {
    if (!scannedCustomer || !selectedProgram) return;
    const updated = {
      ...scannedCustomer,
      programs: scannedCustomer.programs.map((p) =>
        p.id === selectedProgram.id
          ? { ...p, progress: Math.min(p.progress + 1, p.total) }
          : p
      ),
    };
    setScannedCustomer(updated);
    setSelectedProgram(updated.programs.find((p) => p.id === selectedProgram.id) ?? selectedProgram);
    setActionResult({ type: 'stamp', program: selectedProgram.name });
    setScanPhase('stamp-added');
    setLocalValidations((v) => [
      {
        id: Date.now(),
        customer: scannedCustomer.name,
        reward: '+1 Stamp',
        time: 'Just now',
        action: 'stamp',
        program: selectedProgram.name,
      },
      ...v.slice(0, 4),
    ]);
  };

  const handleRedeemReward = () => {
    if (!scannedCustomer || !selectedProgram) return;
    setActionResult({ type: 'redeem', program: selectedProgram.name });
    setScanPhase('reward-redeemed');
    setLocalValidations((v) => [
      {
        id: Date.now(),
        customer: scannedCustomer.name,
        reward: selectedProgram.reward,
        time: 'Just now',
        action: 'redeem',
        program: selectedProgram.name,
      },
      ...v.slice(0, 4),
    ]);
  };

  const handleReset = () => {
    setScanPhase('idle');
    setScannedCustomer(null);
    setSelectedProgram(null);
    setActionResult(null);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Staff Operations</h1>
        <p className="text-gray-500 mt-1">Scan customer QR codes to add stamps or redeem rewards</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main scan area */}
        <div className="col-span-2 space-y-5">

          {/* ── IDLE STATE ── */}
          {scanPhase === 'idle' && (
            <Card>
              <CardBody className="py-10">
                <div className="text-center mb-8">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mx-auto mb-5">
                    <QrCode className="text-indigo-600" size={48} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Scan Customer QR Code</h2>
                  <p className="text-gray-500 text-sm max-w-xs mx-auto">
                    Ask the customer to open their loyalty app and tap <strong>My QR</strong> in the navigation bar
                  </p>
                </div>

                {/* Live QR preview (same code the customer sees) */}
                <div className="flex justify-center mb-8">
                  <div className="p-3 bg-white border-2 border-dashed border-indigo-200 rounded-2xl opacity-50">
                    <QRCodeSVG value={MOCK_QR_PAYLOAD} size={120} level="H" fgColor="#312e81" bgColor="#ffffff" />
                  </div>
                </div>
                <p className="text-center text-xs text-gray-400 -mt-4 mb-6">Preview of customer QR</p>

                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={handleSimulateScan}
                  className="!bg-gradient-to-r !from-indigo-600 !to-violet-600 max-w-sm mx-auto flex"
                >
                  <Scan size={20} />
                  Simulate QR Scan
                </Button>
              </CardBody>
            </Card>
          )}

          {/* ── SCANNING ANIMATION ── */}
          {scanPhase === 'scanning' && (
            <Card>
              <CardBody className="py-14 text-center">
                <div className="relative w-40 h-40 mx-auto mb-6">
                  {/* Animated scanner frame */}
                  <div className="absolute inset-0 rounded-2xl border-4 border-indigo-300 animate-pulse" />
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-600 rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-600 rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-600 rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-600 rounded-br-xl" />
                  {/* Scan line */}
                  <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-bounce top-1/2" />
                  <div className="absolute inset-4 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <QRCodeSVG value={MOCK_QR_PAYLOAD} size={80} level="H" fgColor="#312e81" bgColor="transparent" />
                  </div>
                </div>
                <p className="text-indigo-700 font-semibold">Reading QR code…</p>
                <p className="text-gray-400 text-sm mt-1">Hold steady</p>
              </CardBody>
            </Card>
          )}

          {/* ── CUSTOMER FOUND ── */}
          {(scanPhase === 'success') && scannedCustomer && (
            <Card className="border-2 border-indigo-200">
              <CardBody>
                {/* Customer header */}
                <div className="flex items-center gap-4 pb-5 border-b border-slate-100 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {scannedCustomer.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-lg">{scannedCustomer.name}</h3>
                      <Badge variant="success" size="sm">✓ Verified</Badge>
                    </div>
                    <p className="text-gray-500 text-sm">{scannedCustomer.phone}</p>
                    <p className="font-mono text-xs text-gray-400 mt-0.5">{scannedCustomer.customerId}</p>
                  </div>
                  <button onClick={handleReset} className="text-gray-400 hover:text-gray-600 p-1">
                    <X size={20} />
                  </button>
                </div>

                {/* Program selector */}
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Select Program</h4>
                <div className="space-y-2 mb-6">
                  {scannedCustomer.programs.map((prog) => {
                    const isComplete = prog.progress >= prog.total;
                    const isSelected = selectedProgram?.id === prog.id;
                    return (
                      <button
                        key={prog.id}
                        onClick={() => setSelectedProgram(prog)}
                        className={`w-full flex items-center gap-4 p-3.5 rounded-2xl border-2 transition-all text-left ${
                          isSelected
                            ? 'border-indigo-400 bg-indigo-50'
                            : 'border-slate-200 hover:border-indigo-200 bg-white'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isComplete ? 'bg-emerald-100' : 'bg-indigo-100'
                        }`}>
                          {isComplete
                            ? <Gift className="text-emerald-600" size={20} />
                            : <Plus className="text-indigo-600" size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">{prog.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden max-w-[120px]">
                              <div
                                className={`h-full rounded-full transition-all ${isComplete ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                style={{ width: `${(prog.progress / prog.total) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">{prog.progress}/{prog.total} stamps</span>
                          </div>
                        </div>
                        {isComplete && (
                          <Badge variant="success" size="sm">Ready!</Badge>
                        )}
                        {isSelected && !isComplete && (
                          <div className="w-4 h-4 rounded-full bg-indigo-500 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Actions */}
                {selectedProgram && (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleAddStamp}
                      className="border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                    >
                      <Plus size={18} />
                      Add Stamp
                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleRedeemReward}
                      disabled={selectedProgram.progress < selectedProgram.total}
                      className={`${
                        selectedProgram.progress >= selectedProgram.total
                          ? '!bg-gradient-to-r !from-emerald-500 !to-teal-500'
                          : '!bg-gray-200 !text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Gift size={18} />
                      Redeem {selectedProgram.reward}
                    </Button>
                  </div>
                )}
                {selectedProgram && selectedProgram.progress < selectedProgram.total && (
                  <p className="text-center text-xs text-gray-400 mt-2">
                    {selectedProgram.total - selectedProgram.progress} more stamp{selectedProgram.total - selectedProgram.progress !== 1 ? 's' : ''} needed to redeem <strong>{selectedProgram.reward}</strong>
                  </p>
                )}
              </CardBody>
            </Card>
          )}

          {/* ── STAMP ADDED ── */}
          {scanPhase === 'stamp-added' && actionResult && (
            <Card className="border-2 border-indigo-200">
              <CardBody className="py-10 text-center">
                <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="text-indigo-600" size={44} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Stamp Added!</h2>
                <p className="text-gray-500 text-sm mb-1">
                  <strong>{scannedCustomer?.name}</strong> — {actionResult.program}
                </p>
                <p className="text-indigo-600 font-semibold text-sm mb-6">
                  New total: {selectedProgram?.progress}/{selectedProgram?.total}
                </p>
                {selectedProgram && selectedProgram.progress >= selectedProgram.total && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 mb-6 inline-flex items-center gap-2">
                    <Zap className="text-emerald-600" size={18} />
                    <span className="text-emerald-700 font-semibold text-sm">Card complete — {selectedProgram.reward} unlocked!</span>
                  </div>
                )}
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={handleReset}>
                    <RotateCcw size={16} />
                    New Scan
                  </Button>
                  <Button
                    variant="primary"
                    className="!bg-gradient-to-r !from-indigo-600 !to-violet-600"
                    onClick={() => setScanPhase('success')}
                  >
                    Back to Customer
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          {/* ── REWARD REDEEMED ── */}
          {scanPhase === 'reward-redeemed' && actionResult && (
            <Card className="border-2 border-emerald-300">
              <CardBody className="py-10 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                  <Gift className="text-emerald-600" size={44} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Reward Redeemed!</h2>
                <p className="text-gray-500 text-sm mb-1">
                  <strong>{scannedCustomer?.name}</strong>
                </p>
                <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-2.5 mb-6">
                  <CheckCircle2 className="text-emerald-600" size={18} />
                  <span className="text-emerald-700 font-bold">{selectedProgram?.reward}</span>
                  <span className="text-emerald-600 text-sm">· {actionResult.program}</span>
                </div>
                <p className="text-xs text-gray-400 mb-6">Stamps have been reset for this program</p>
                <Button
                  variant="primary"
                  className="!bg-gradient-to-r !from-indigo-600 !to-violet-600"
                  onClick={handleReset}
                >
                  <RotateCcw size={16} />
                  New Scan
                </Button>
              </CardBody>
            </Card>
          )}

          {/* Search fallback */}
          {scanPhase === 'idle' && (
            <Card>
              <CardBody>
                <h3 className="font-semibold text-gray-800 mb-3">Or Search by Phone / ID</h3>
                <div className="flex gap-3">
                  <Input
                    placeholder="+218 9X XXX XXXX or LY-XXXX-XXXXXX"
                    icon={<Search size={18} />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="primary" className="!bg-gradient-to-r !from-indigo-600 !to-violet-600">
                    Search
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Recent validations sidebar */}
        <div>
          <Card className="sticky top-4">
            <CardBody>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock size={16} className="text-indigo-500" />
                Recent Validations
              </h3>
              <div className="space-y-3">
                {localValidations.map((v) => (
                  <div key={v.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      v.action === 'redeem' ? 'bg-emerald-100' : 'bg-indigo-100'
                    }`}>
                      {v.action === 'redeem'
                        ? <Gift className="text-emerald-600" size={14} />
                        : <Plus className="text-indigo-600" size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{v.customer}</p>
                      <p className="text-xs text-gray-600 truncate">{v.reward} · {v.program}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{v.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                <div className="text-center bg-indigo-50 rounded-xl py-3">
                  <p className="text-xl font-bold text-indigo-700">
                    {localValidations.filter(v => v.action === 'stamp').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Stamps Today</p>
                </div>
                <div className="text-center bg-emerald-50 rounded-xl py-3">
                  <p className="text-xl font-bold text-emerald-700">
                    {localValidations.filter(v => v.action === 'redeem').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Redeemed</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
