import 'package:flutter/material.dart';
import 'package:kerugoya_deliveries_mobile/screens/register_client_screen.dart';
import 'package:kerugoya_deliveries_mobile/screens/register_rider_screen.dart';
import 'package:kerugoya_deliveries_mobile/screens/forgot_password_screen.dart';
import 'package:kerugoya_deliveries_mobile/services/auth_service.dart';
import 'package:kerugoya_deliveries_mobile/services/api_service.dart';
import 'package:provider/provider.dart';
import 'package:kerugoya_deliveries_mobile/services/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _showMockButtons = false;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() { _isLoading = true; });

    try {
      final String token = await AuthService().login(
        _emailController.text,
        _passwordController.text,
      );
      if (mounted) {
        Provider.of<AuthProvider>(context, listen: false).saveToken(token);
        // Do NOT pop() as Consumer in main.dart will switch screens based on Auth state
        // If it was pushed as a separate route (unlikely for root), we check
        if (Navigator.of(context).canPop()) {
           Navigator.of(context).pop();
        }
      }
    } on HttpException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message), backgroundColor: Colors.red));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Login failed: ${e.toString()}'), backgroundColor: Colors.red));
      }
    } finally {
      if (mounted) {
        setState(() { _isLoading = false; });
      }
    }
  }

  void _mockLogin(String role) async {
     setState(() { _isLoading = true; });
     String email = "client@test.com";
     String pass = "client123";
     if (role == 'RIDER') { email = "rider@test.com"; pass = "rider123"; }
     if (role == 'ADMIN') { email = "admin@test.com"; pass = "admin123"; }
     
     try {
       final String token = await AuthService().login(email, pass);
       if (mounted) {
          Provider.of<AuthProvider>(context, listen: false).saveToken(token);
          if (Navigator.of(context).canPop()) {
            Navigator.of(context).pop();
          }
       }
     } catch (e) {
       if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Mock login failed. Check dev accounts.")));
     } finally {
       if (mounted) setState(() { _isLoading = false; });
     }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Sign In'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 10),
              GestureDetector(
                onLongPress: () {
                  setState(() { _showMockButtons = !_showMockButtons; });
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(_showMockButtons ? 'Dev Mode Enabled' : 'Dev Mode Disabled'), duration: const Duration(seconds: 1)),
                  );
                },
                child: Center(
                  child: Hero(
                    tag: 'logo',
                    child: Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.orange.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Image.asset('assets/kerugoya-deliveries-logo.jpg', height: 80),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 32),
              const Text(
                'Welcome Back',
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, letterSpacing: -1),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Enter your credentials to continue',
                style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),
              TextFormField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(
                  labelText: 'Email or Phone', 
                  prefixIcon: Icon(Icons.person_outline),
                  hintText: 'user@example.com or 07xxxxxxxx'
                ),
                validator: (value) => value == null || value.isEmpty ? 'Enter email or phone' : null,
              ),
              const SizedBox(height: 20),
              TextFormField(
                controller: _passwordController,
                obscureText: _obscurePassword,
                decoration: InputDecoration(
                  labelText: 'Password', 
                  prefixIcon: const Icon(Icons.lock_outline),
                  suffixIcon: IconButton(
                    icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility),
                    onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                  )
                ),
                validator: (value) => value == null || value.isEmpty ? 'Enter password' : null,
              ),
              const SizedBox(height: 12),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const ForgotPasswordScreen())),
                  child: const Text('Forgot Password?', style: TextStyle(color: Colors.orange, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 24),
              _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : ElevatedButton(
                      onPressed: _login,
                      child: const Text('Login'),
                    ),
              
              if (_showMockButtons) ...[
                const SizedBox(height: 32),
                const Center(child: Text("DEV ACCESS (BYPASS LOGIN)", style: TextStyle(fontSize: 12, color: Colors.blue, fontWeight: FontWeight.bold, letterSpacing: 1.5))),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.blue.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.blue.withOpacity(0.1)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _buildMockButton('CLIENT', Icons.person_search),
                      _buildMockButton('RIDER', Icons.moped),
                      _buildMockButton('ADMIN', Icons.dashboard_customize),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                const Center(child: Text("Use these for instant testing/demo", style: TextStyle(fontSize: 10, color: Colors.grey))),
              ],

              const SizedBox(height: 40),
              const Row(
                children: [
                  Expanded(child: Divider()),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: Text('NEW TO KERUGOYA?', style: TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.bold)),
                  ),
                  Expanded(child: Divider()),
                ],
              ),
              const SizedBox(height: 20),
              OutlinedButton(
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const RegisterClientScreen())),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 54),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  side: const BorderSide(color: Colors.black12),
                ),
                child: const Text('Register as Client', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const RegisterRiderScreen())),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 54),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  side: const BorderSide(color: Colors.black12),
                ),
                child: const Text('Register as Rider', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMockButton(String role, IconData icon) {
    return Column(
      children: [
        IconButton.filled(
          onPressed: () => _mockLogin(role),
          icon: Icon(icon),
          style: IconButton.styleFrom(backgroundColor: Colors.orange.withOpacity(0.2), foregroundColor: Colors.orange[900]),
        ),
        Text(role, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
      ],
    );
  }
}
