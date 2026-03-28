import 'package:flutter/material.dart';
import 'package:kerugoya_deliveries_mobile/screens/register_client_screen.dart';
import 'package:kerugoya_deliveries_mobile/screens/register_rider_screen.dart';
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
        Navigator.of(context).pop();
      }
    } on HttpException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Login failed: ${e.toString()}')));
      }
    } finally {
      if (mounted) {
        setState(() { _isLoading = false; });
      }
    }
  }

  void _mockLogin(String role) async {
     setState(() { _isLoading = true; });
     String email = "test@client.com";
     if (role == 'RIDER') email = "test@rider.com";
     if (role == 'ADMIN') email = "test@admin.com";
     
     final String token = await AuthService().login(email, "password");
     if (mounted) {
        Provider.of<AuthProvider>(context, listen: false).saveToken(token);
        Navigator.of(context).pop();
     }
     setState(() { _isLoading = false; });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Login')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              const SizedBox(height: 20),
              GestureDetector(
                onLongPress: () {
                  setState(() { _showMockButtons = !_showMockButtons; });
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(_showMockButtons ? 'Dev Mode Enabled' : 'Dev Mode Disabled'), duration: const Duration(seconds: 1)),
                  );
                },
                child: Image.asset('assets/logo.jpg', height: 100),
              ),
              const SizedBox(height: 40),
              TextFormField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(labelText: 'Email', prefixIcon: Icon(Icons.email)),
                validator: (value) => value == null || value.isEmpty ? 'Enter email' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _passwordController,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'Password', prefixIcon: Icon(Icons.lock)),
                validator: (value) => value == null || value.isEmpty ? 'Enter password' : null,
              ),
              const SizedBox(height: 24),
              _isLoading
                  ? const CircularProgressIndicator()
                  : ElevatedButton(
                      onPressed: _login,
                      style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 50), backgroundColor: Colors.black, foregroundColor: Colors.white),
                      child: const Text('Login'),
                    ),
              
              if (_showMockButtons) ...[
                const SizedBox(height: 16),
                const Text("DEV MODE: MOCK LOGIN", style: TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    ElevatedButton(onPressed: () => _mockLogin('CLIENT'), child: const Text('Client')),
                    ElevatedButton(onPressed: () => _mockLogin('RIDER'), child: const Text('Rider')),
                    ElevatedButton(onPressed: () => _mockLogin('ADMIN'), child: const Text('Admin')),
                  ],
                ),
              ],

              const SizedBox(height: 24),
              TextButton(
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const RegisterClientScreen())),
                child: const Text('Register as Client'),
              ),
              TextButton(
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const RegisterRiderScreen())),
                child: const Text('Register as Rider'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
