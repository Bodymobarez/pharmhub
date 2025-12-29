import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    // Simulate login - Replace with actual API call
    await Future.delayed(const Duration(seconds: 1));

    if (mounted) {
      setState(() => _isLoading = false);
      context.go('/');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 60),
                
                // Logo
                Center(
                  child: Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [AppTheme.neonGreen, AppTheme.neonCyan],
                      ),
                      borderRadius: BorderRadius.circular(25),
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.neonGreen.withOpacity(0.3),
                          blurRadius: 20,
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.local_pharmacy,
                      size: 50,
                      color: Colors.black,
                    ),
                  ),
                ),
                
                const SizedBox(height: 24),
                
                // Title
                const Text(
                  'تسجيل الدخول',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                
                const SizedBox(height: 8),
                
                Text(
                  'أدخل بياناتك للوصول إلى النظام',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.white.withOpacity(0.7),
                  ),
                  textAlign: TextAlign.center,
                ),
                
                const SizedBox(height: 48),
                
                // Username Field
                TextFormField(
                  controller: _usernameController,
                  decoration: const InputDecoration(
                    labelText: 'اسم المستخدم',
                    prefixIcon: Icon(Icons.person_outline),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'يرجى إدخال اسم المستخدم';
                    }
                    return null;
                  },
                ),
                
                const SizedBox(height: 16),
                
                // Password Field
                TextFormField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  decoration: InputDecoration(
                    labelText: 'كلمة المرور',
                    prefixIcon: const Icon(Icons.lock_outline),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword
                            ? Icons.visibility_outlined
                            : Icons.visibility_off_outlined,
                      ),
                      onPressed: () {
                        setState(() => _obscurePassword = !_obscurePassword);
                      },
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'يرجى إدخال كلمة المرور';
                    }
                    return null;
                  },
                ),
                
                const SizedBox(height: 32),
                
                // Login Button
                SizedBox(
                  height: 56,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _handleLogin,
                    child: _isLoading
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.black,
                            ),
                          )
                        : const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text('تسجيل الدخول'),
                              SizedBox(width: 8),
                              Icon(Icons.arrow_back, size: 20),
                            ],
                          ),
                  ),
                ),
                
                const SizedBox(height: 24),
                
                // Demo Credentials
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: Colors.white.withOpacity(0.1),
                    ),
                  ),
                  child: Column(
                    children: [
                      Text(
                        'للتجربة:',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.7),
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'المستخدم: owner\nكلمة المرور: owner123',
                        style: TextStyle(
                          fontFamily: 'monospace',
                          fontSize: 14,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

