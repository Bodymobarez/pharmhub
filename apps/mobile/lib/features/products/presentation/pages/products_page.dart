import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';

class ProductsPage extends ConsumerWidget {
  const ProductsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Sample products data
    final products = [
      {'name': 'بانادول إكسترا', 'category': 'مسكنات', 'price': 25.0, 'stock': 50},
      {'name': 'بروفين 400', 'category': 'مسكنات', 'price': 35.0, 'stock': 30},
      {'name': 'أوجمنتين 1 جم', 'category': 'مضادات حيوية', 'price': 120.0, 'stock': 20},
      {'name': 'فيتامين C 1000', 'category': 'فيتامينات', 'price': 40.0, 'stock': 100},
      {'name': 'أسبرين 75', 'category': 'أدوية القلب', 'price': 15.0, 'stock': 80},
      {'name': 'زيرتك', 'category': 'مضادات الحساسية', 'price': 45.0, 'stock': 25},
      {'name': 'نيكسيوم 40', 'category': 'أدوية المعدة', 'price': 85.0, 'stock': 15},
      {'name': 'ليبيتور 20', 'category': 'أدوية الكوليسترول', 'price': 95.0, 'stock': 40},
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('المنتجات'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // Search
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'بحث عن منتج...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.qr_code_scanner),
                  onPressed: () {},
                ),
              ),
            ),
          ),

          // Stats
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                _StatChip(
                  label: 'إجمالي',
                  value: '${products.length}',
                  color: AppTheme.primary,
                ),
                const SizedBox(width: 8),
                _StatChip(
                  label: 'منخفض',
                  value: '5',
                  color: AppTheme.warning,
                ),
                const SizedBox(width: 8),
                _StatChip(
                  label: 'نفذ',
                  value: '2',
                  color: AppTheme.error,
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Products List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: products.length,
              itemBuilder: (context, index) {
                final product = products[index];
                final isLowStock = (product['stock'] as int) < 25;

                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white.withOpacity(0.1)),
                  ),
                  child: Row(
                    children: [
                      // Product Icon
                      Container(
                        width: 50,
                        height: 50,
                        decoration: BoxDecoration(
                          color: AppTheme.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.medication,
                          color: AppTheme.primary,
                        ),
                      ),

                      const SizedBox(width: 12),

                      // Product Info
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              product['name'] as String,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              product['category'] as String,
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.white.withOpacity(0.7),
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Price & Stock
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            '${product['price']} ج.م',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              color: AppTheme.primary,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: isLowStock
                                  ? AppTheme.warning.withOpacity(0.1)
                                  : AppTheme.success.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              '${product['stock']} وحدة',
                              style: TextStyle(
                                fontSize: 12,
                                color: isLowStock
                                    ? AppTheme.warning
                                    : AppTheme.success,
                              ),
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
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        icon: const Icon(Icons.add, color: Colors.black),
        label: const Text(
          'إضافة منتج',
          style: TextStyle(color: Colors.black),
        ),
        backgroundColor: AppTheme.primary,
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _StatChip({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: color.withOpacity(0.8),
            ),
          ),
        ],
      ),
    );
  }
}

