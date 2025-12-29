import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/splash_page.dart';
import '../../features/home/presentation/pages/home_page.dart';
import '../../features/pos/presentation/pages/pos_page.dart';
import '../../features/products/presentation/pages/products_page.dart';
import '../../features/scanner/presentation/pages/scanner_page.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/splash',
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashPage(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
      ),
      ShellRoute(
        builder: (context, state, child) => HomeShell(child: child),
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => const HomePage(),
          ),
          GoRoute(
            path: '/pos',
            builder: (context, state) => const POSPage(),
          ),
          GoRoute(
            path: '/products',
            builder: (context, state) => const ProductsPage(),
          ),
          GoRoute(
            path: '/scanner',
            builder: (context, state) => const ScannerPage(),
          ),
        ],
      ),
    ],
  );
});

class HomeShell extends StatelessWidget {
  final Widget child;

  const HomeShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _getSelectedIndex(context),
        onDestinationSelected: (index) => _onDestinationSelected(context, index),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard),
            label: 'الرئيسية',
          ),
          NavigationDestination(
            icon: Icon(Icons.point_of_sale_outlined),
            selectedIcon: Icon(Icons.point_of_sale),
            label: 'البيع',
          ),
          NavigationDestination(
            icon: Icon(Icons.qr_code_scanner_outlined),
            selectedIcon: Icon(Icons.qr_code_scanner),
            label: 'الماسح',
          ),
          NavigationDestination(
            icon: Icon(Icons.inventory_2_outlined),
            selectedIcon: Icon(Icons.inventory_2),
            label: 'المنتجات',
          ),
        ],
      ),
    );
  }

  int _getSelectedIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    if (location == '/') return 0;
    if (location == '/pos') return 1;
    if (location == '/scanner') return 2;
    if (location == '/products') return 3;
    return 0;
  }

  void _onDestinationSelected(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/');
        break;
      case 1:
        context.go('/pos');
        break;
      case 2:
        context.go('/scanner');
        break;
      case 3:
        context.go('/products');
        break;
    }
  }
}

