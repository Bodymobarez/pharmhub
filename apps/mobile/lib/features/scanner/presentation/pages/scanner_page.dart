import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../../../core/theme/app_theme.dart';

class ScannerPage extends ConsumerStatefulWidget {
  const ScannerPage({super.key});

  @override
  ConsumerState<ScannerPage> createState() => _ScannerPageState();
}

class _ScannerPageState extends ConsumerState<ScannerPage> {
  MobileScannerController? _controller;
  bool _isScanning = true;
  String? _lastScanned;

  @override
  void initState() {
    super.initState();
    _controller = MobileScannerController(
      detectionSpeed: DetectionSpeed.normal,
      facing: CameraFacing.back,
    );
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  void _onDetect(BarcodeCapture capture) {
    if (!_isScanning) return;

    final List<Barcode> barcodes = capture.barcodes;
    for (final barcode in barcodes) {
      if (barcode.rawValue != null && barcode.rawValue != _lastScanned) {
        setState(() {
          _lastScanned = barcode.rawValue;
          _isScanning = false;
        });

        // Show product dialog
        _showProductDialog(barcode.rawValue!);
      }
    }
  }

  void _showProductDialog(String barcode) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppTheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => _ProductSheet(
        barcode: barcode,
        onClose: () {
          Navigator.pop(context);
          setState(() {
            _isScanning = true;
            _lastScanned = null;
          });
        },
        onAddToCart: () {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('تم إضافة المنتج للسلة'),
              backgroundColor: AppTheme.success,
            ),
          );
          setState(() {
            _isScanning = true;
            _lastScanned = null;
          });
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ماسح الباركود'),
        actions: [
          IconButton(
            icon: Icon(
              _controller?.torchEnabled ?? false
                  ? Icons.flash_on
                  : Icons.flash_off,
            ),
            onPressed: () => _controller?.toggleTorch(),
          ),
          IconButton(
            icon: const Icon(Icons.cameraswitch),
            onPressed: () => _controller?.switchCamera(),
          ),
        ],
      ),
      body: Stack(
        children: [
          // Camera View
          if (_controller != null)
            MobileScanner(
              controller: _controller!,
              onDetect: _onDetect,
            ),

          // Overlay
          Container(
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.3),
            ),
          ),

          // Scanner Frame
          Center(
            child: Container(
              width: 280,
              height: 280,
              decoration: BoxDecoration(
                border: Border.all(
                  color: _isScanning ? AppTheme.primary : AppTheme.success,
                  width: 3,
                ),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Stack(
                children: [
                  // Corner decorations
                  Positioned(
                    top: -2,
                    right: -2,
                    child: _CornerDecoration(
                      color: _isScanning ? AppTheme.primary : AppTheme.success,
                    ),
                  ),
                  Positioned(
                    top: -2,
                    left: -2,
                    child: _CornerDecoration(
                      color: _isScanning ? AppTheme.primary : AppTheme.success,
                      rotation: 1,
                    ),
                  ),
                  Positioned(
                    bottom: -2,
                    right: -2,
                    child: _CornerDecoration(
                      color: _isScanning ? AppTheme.primary : AppTheme.success,
                      rotation: 3,
                    ),
                  ),
                  Positioned(
                    bottom: -2,
                    left: -2,
                    child: _CornerDecoration(
                      color: _isScanning ? AppTheme.primary : AppTheme.success,
                      rotation: 2,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Instructions
          Positioned(
            bottom: 100,
            left: 0,
            right: 0,
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    color: AppTheme.surface,
                    borderRadius: BorderRadius.circular(30),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        _isScanning ? Icons.qr_code_scanner : Icons.check_circle,
                        color: _isScanning ? AppTheme.primary : AppTheme.success,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        _isScanning
                            ? 'وجه الكاميرا نحو الباركود'
                            : 'تم المسح بنجاح!',
                        style: TextStyle(
                          color: _isScanning
                              ? Colors.white
                              : AppTheme.success,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                if (_lastScanned != null) ...[
                  const SizedBox(height: 12),
                  Text(
                    _lastScanned!,
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.7),
                      fontFamily: 'monospace',
                    ),
                  ),
                ],
              ],
            ),
          ),

          // Manual Input Button
          Positioned(
            bottom: 30,
            left: 16,
            right: 16,
            child: ElevatedButton.icon(
              onPressed: () => _showManualInput(),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.surface,
                foregroundColor: Colors.white,
              ),
              icon: const Icon(Icons.keyboard),
              label: const Text('إدخال يدوي'),
            ),
          ),
        ],
      ),
    );
  }

  void _showManualInput() {
    showDialog(
      context: context,
      builder: (context) {
        final controller = TextEditingController();
        return AlertDialog(
          backgroundColor: AppTheme.surface,
          title: const Text('إدخال الباركود'),
          content: TextField(
            controller: controller,
            autofocus: true,
            decoration: const InputDecoration(
              hintText: 'أدخل رقم الباركود',
            ),
            keyboardType: TextInputType.number,
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('إلغاء'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                if (controller.text.isNotEmpty) {
                  _showProductDialog(controller.text);
                }
              },
              child: const Text('بحث'),
            ),
          ],
        );
      },
    );
  }
}

class _CornerDecoration extends StatelessWidget {
  final Color color;
  final int rotation;

  const _CornerDecoration({
    required this.color,
    this.rotation = 0,
  });

  @override
  Widget build(BuildContext context) {
    return RotatedBox(
      quarterTurns: rotation,
      child: Container(
        width: 30,
        height: 30,
        decoration: BoxDecoration(
          border: Border(
            top: BorderSide(color: color, width: 4),
            right: BorderSide(color: color, width: 4),
          ),
        ),
      ),
    );
  }
}

class _ProductSheet extends StatelessWidget {
  final String barcode;
  final VoidCallback onClose;
  final VoidCallback onAddToCart;

  const _ProductSheet({
    required this.barcode,
    required this.onClose,
    required this.onAddToCart,
  });

  @override
  Widget build(BuildContext context) {
    // Simulated product data
    final product = {
      'name': 'بانادول إكسترا',
      'genericName': 'Paracetamol',
      'price': 25.0,
      'stock': 50,
    };

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.3),
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          const SizedBox(height: 24),

          // Product Icon
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppTheme.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Icon(
              Icons.medication,
              size: 40,
              color: AppTheme.primary,
            ),
          ),

          const SizedBox(height: 16),

          // Product Name
          Text(
            product['name'] as String,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),

          Text(
            product['genericName'] as String,
            style: TextStyle(
              color: Colors.white.withOpacity(0.7),
            ),
          ),

          const SizedBox(height: 8),

          // Barcode
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: AppTheme.background,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              barcode,
              style: const TextStyle(
                fontFamily: 'monospace',
                fontSize: 12,
              ),
            ),
          ),

          const SizedBox(height: 24),

          // Price & Stock
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.background,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    children: [
                      Text(
                        'السعر',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.7),
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${product['price']} ج.م',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.background,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    children: [
                      Text(
                        'المخزون',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.7),
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${product['stock']}',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Actions
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: onClose,
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    side: BorderSide(color: Colors.white.withOpacity(0.3)),
                  ),
                  child: const Text('مسح جديد'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: onAddToCart,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: const Text('إضافة للسلة'),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

