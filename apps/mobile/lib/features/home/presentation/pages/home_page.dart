import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'مرحباً',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.white.withOpacity(0.7),
                        ),
                      ),
                      const Text(
                        'صيدلية الأمل',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: AppTheme.primary.withOpacity(0.2),
                    child: const Icon(
                      Icons.person,
                      color: AppTheme.primary,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Quick Actions
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      AppTheme.primary,
                      AppTheme.neonCyan,
                    ],
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primary.withOpacity(0.3),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'بدء عملية بيع',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Colors.black,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'اضغط للذهاب لنقطة البيع',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.black.withOpacity(0.7),
                            ),
                          ),
                        ],
                      ),
                    ),
                    GestureDetector(
                      onTap: () => context.go('/pos'),
                      child: Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(15),
                        ),
                        child: const Icon(
                          Icons.point_of_sale,
                          size: 30,
                          color: Colors.black,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Stats Grid
              Row(
                children: [
                  Expanded(
                    child: _StatCard(
                      title: 'مبيعات اليوم',
                      value: '1,250',
                      subtitle: 'ج.م',
                      icon: Icons.trending_up,
                      color: AppTheme.neonGreen,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _StatCard(
                      title: 'الفواتير',
                      value: '15',
                      subtitle: 'فاتورة',
                      icon: Icons.receipt_long,
                      color: AppTheme.neonCyan,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),

              Row(
                children: [
                  Expanded(
                    child: _StatCard(
                      title: 'المنتجات',
                      value: '248',
                      subtitle: 'منتج',
                      icon: Icons.inventory_2,
                      color: AppTheme.neonPurple,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _StatCard(
                      title: 'منخفض',
                      value: '5',
                      subtitle: 'تنبيه',
                      icon: Icons.warning_amber,
                      color: AppTheme.warning,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Quick Actions Grid
              const Text(
                'إجراءات سريعة',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),

              const SizedBox(height: 16),

              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 4,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                children: [
                  _QuickAction(
                    icon: Icons.qr_code_scanner,
                    label: 'مسح',
                    onTap: () => context.go('/scanner'),
                  ),
                  _QuickAction(
                    icon: Icons.add_box,
                    label: 'إضافة',
                    onTap: () {},
                  ),
                  _QuickAction(
                    icon: Icons.inventory,
                    label: 'المخزون',
                    onTap: () => context.go('/products'),
                  ),
                  _QuickAction(
                    icon: Icons.bar_chart,
                    label: 'تقارير',
                    onTap: () {},
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Recent Sales
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'آخر المبيعات',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  TextButton(
                    onPressed: () {},
                    child: const Text('عرض الكل'),
                  ),
                ],
              ),

              const SizedBox(height: 12),

              // Sample sales
              ...List.generate(
                3,
                (index) => _SaleItem(
                  invoiceNumber: 'INV-${1000 + index}',
                  amount: (150.0 + index * 50),
                  time: '${10 + index}:${30 + index * 5}',
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final String subtitle;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.title,
    required this.value,
    required this.subtitle,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.white.withOpacity(0.7),
                ),
              ),
              Icon(icon, size: 20, color: color),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                value,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(width: 4),
              Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.white.withOpacity(0.5),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _QuickAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _QuickAction({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white.withOpacity(0.1)),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: AppTheme.primary),
            const SizedBox(height: 4),
            Text(
              label,
              style: const TextStyle(fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }
}

class _SaleItem extends StatelessWidget {
  final String invoiceNumber;
  final double amount;
  final String time;

  const _SaleItem({
    required this.invoiceNumber,
    required this.amount,
    required this.time,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppTheme.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(
              Icons.receipt,
              color: AppTheme.primary,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  invoiceNumber,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                Text(
                  'اليوم $time',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.white.withOpacity(0.5),
                  ),
                ),
              ],
            ),
          ),
          Text(
            '${amount.toStringAsFixed(2)} ج.م',
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              color: AppTheme.primary,
            ),
          ),
        ],
      ),
    );
  }
}

