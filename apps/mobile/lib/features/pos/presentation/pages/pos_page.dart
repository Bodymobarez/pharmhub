import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';

class POSPage extends ConsumerStatefulWidget {
  const POSPage({super.key});

  @override
  ConsumerState<POSPage> createState() => _POSPageState();
}

class _POSPageState extends ConsumerState<POSPage> {
  final List<CartItem> _cart = [];
  final _searchController = TextEditingController();

  double get subtotal => _cart.fold(0, (sum, item) => sum + item.total);
  double get total => subtotal;

  void _addToCart(Map<String, dynamic> product) {
    final existingIndex = _cart.indexWhere((item) => item.id == product['id']);
    
    setState(() {
      if (existingIndex >= 0) {
        _cart[existingIndex].quantity++;
      } else {
        _cart.add(CartItem(
          id: product['id'],
          name: product['name'],
          price: product['price'],
          quantity: 1,
        ));
      }
    });
  }

  void _updateQuantity(String id, int delta) {
    setState(() {
      final index = _cart.indexWhere((item) => item.id == id);
      if (index >= 0) {
        _cart[index].quantity += delta;
        if (_cart[index].quantity <= 0) {
          _cart.removeAt(index);
        }
      }
    });
  }

  void _showPaymentSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppTheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => _PaymentSheet(
        total: total,
        onComplete: () {
          Navigator.pop(context);
          setState(() => _cart.clear());
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('تم إتمام البيع بنجاح'),
              backgroundColor: AppTheme.success,
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Sample products
    final products = [
      {'id': '1', 'name': 'بانادول', 'price': 25.0, 'stock': 50},
      {'id': '2', 'name': 'بروفين', 'price': 35.0, 'stock': 30},
      {'id': '3', 'name': 'أوجمنتين', 'price': 120.0, 'stock': 20},
      {'id': '4', 'name': 'فيتامين C', 'price': 40.0, 'stock': 100},
      {'id': '5', 'name': 'أسبرين', 'price': 15.0, 'stock': 80},
      {'id': '6', 'name': 'زيرتك', 'price': 45.0, 'stock': 25},
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('نقطة البيع'),
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_scanner),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'بحث عن منتج أو امسح الباركود...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.qr_code_scanner),
                  onPressed: () {},
                ),
              ),
            ),
          ),

          // Products Grid
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 1.3,
              ),
              itemCount: products.length,
              itemBuilder: (context, index) {
                final product = products[index];
                return GestureDetector(
                  onTap: () => _addToCart(product),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.surface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.white.withOpacity(0.1)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          product['name'] as String,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '${product['price']} ج.م',
                              style: const TextStyle(
                                color: AppTheme.primary,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: AppTheme.primary.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                '${product['stock']}',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: AppTheme.primary,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // Cart Summary
          if (_cart.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.surface,
                border: Border(
                  top: BorderSide(color: Colors.white.withOpacity(0.1)),
                ),
              ),
              child: Column(
                children: [
                  // Cart Items
                  SizedBox(
                    height: 60,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: _cart.length,
                      itemBuilder: (context, index) {
                        final item = _cart[index];
                        return Container(
                          margin: const EdgeInsets.only(left: 8),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: AppTheme.primary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    item.name,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                  Text(
                                    '${item.total.toStringAsFixed(2)} ج.م',
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: AppTheme.primary,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(width: 8),
                              Row(
                                children: [
                                  GestureDetector(
                                    onTap: () => _updateQuantity(item.id, -1),
                                    child: Container(
                                      width: 24,
                                      height: 24,
                                      decoration: BoxDecoration(
                                        color: AppTheme.surface,
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: const Icon(Icons.remove, size: 16),
                                    ),
                                  ),
                                  Padding(
                                    padding: const EdgeInsets.symmetric(horizontal: 8),
                                    child: Text(
                                      '${item.quantity}',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                  GestureDetector(
                                    onTap: () => _updateQuantity(item.id, 1),
                                    child: Container(
                                      width: 24,
                                      height: 24,
                                      decoration: BoxDecoration(
                                        color: AppTheme.surface,
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: const Icon(Icons.add, size: 16),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Total & Pay Button
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'الإجمالي',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.7),
                              ),
                            ),
                            Text(
                              '${total.toStringAsFixed(2)} ج.م',
                              style: const TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.primary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(
                        height: 56,
                        child: ElevatedButton.icon(
                          onPressed: _showPaymentSheet,
                          icon: const Icon(Icons.payment),
                          label: const Text('دفع'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class CartItem {
  final String id;
  final String name;
  final double price;
  int quantity;

  CartItem({
    required this.id,
    required this.name,
    required this.price,
    required this.quantity,
  });

  double get total => price * quantity;
}

class _PaymentSheet extends StatefulWidget {
  final double total;
  final VoidCallback onComplete;

  const _PaymentSheet({
    required this.total,
    required this.onComplete,
  });

  @override
  State<_PaymentSheet> createState() => _PaymentSheetState();
}

class _PaymentSheetState extends State<_PaymentSheet> {
  String _selectedMethod = 'CASH';
  final _paidController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final paid = double.tryParse(_paidController.text) ?? 0;
    final change = paid - widget.total;

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

          const Text(
            'إتمام الدفع',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),

          const SizedBox(height: 24),

          // Payment Methods
          Row(
            children: [
              _PaymentMethod(
                icon: Icons.money,
                label: 'نقدي',
                isSelected: _selectedMethod == 'CASH',
                onTap: () => setState(() => _selectedMethod = 'CASH'),
              ),
              const SizedBox(width: 12),
              _PaymentMethod(
                icon: Icons.credit_card,
                label: 'بطاقة',
                isSelected: _selectedMethod == 'CARD',
                onTap: () => setState(() => _selectedMethod = 'CARD'),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Total
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('الإجمالي'),
                Text(
                  '${widget.total.toStringAsFixed(2)} ج.م',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primary,
                  ),
                ),
              ],
            ),
          ),

          if (_selectedMethod == 'CASH') ...[
            const SizedBox(height: 16),

            // Paid Amount
            TextField(
              controller: _paidController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'المبلغ المدفوع',
                suffixText: 'ج.م',
              ),
              onChanged: (_) => setState(() {}),
            ),

            if (paid >= widget.total) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.success.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('الباقي'),
                    Text(
                      '${change.toStringAsFixed(2)} ج.م',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.success,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],

          const SizedBox(height: 24),

          // Confirm Button
          SizedBox(
            width: double.infinity,
            height: 56,
            child: ElevatedButton(
              onPressed: (_selectedMethod == 'CARD' || paid >= widget.total)
                  ? widget.onComplete
                  : null,
              child: const Text('تأكيد'),
            ),
          ),

          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

class _PaymentMethod extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _PaymentMethod({
    required this.icon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isSelected ? AppTheme.primary.withOpacity(0.1) : AppTheme.background,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? AppTheme.primary : Colors.white.withOpacity(0.1),
              width: 2,
            ),
          ),
          child: Column(
            children: [
              Icon(
                icon,
                color: isSelected ? AppTheme.primary : Colors.white.withOpacity(0.7),
              ),
              const SizedBox(height: 8),
              Text(
                label,
                style: TextStyle(
                  color: isSelected ? AppTheme.primary : Colors.white.withOpacity(0.7),
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

