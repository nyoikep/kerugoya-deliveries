import 'package:flutter/material.dart';
import 'package:kerugoya_deliveries_mobile/services/auth_service.dart';
import 'package:kerugoya_deliveries_mobile/services/api_service.dart';
import 'package:provider/provider.dart';
import 'package:kerugoya_deliveries_mobile/services/auth_provider.dart';
import 'package:image_picker/image_picker.dart';

class RegisterRiderScreen extends StatefulWidget {
  const RegisterRiderScreen({super.key});

  @override
  State<RegisterRiderScreen> createState() => _RegisterRiderScreenState();
}

class _RegisterRiderScreenState extends State<RegisterRiderScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _idNumberController = TextEditingController();
  final _motorcyclePlateNumberController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  String? _idCardPath;
  String? _idCardName;
  bool _obscurePassword = true;
  final ImagePicker _picker = ImagePicker();

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _idNumberController.dispose();
    _motorcyclePlateNumberController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _pickIdCard() async {
    try {
      final XFile? image = await _picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1000,
        maxHeight: 1000,
        imageQuality: 85,
      );
      
      if (image != null) {
        setState(() {
          _idCardPath = image.path;
          _idCardName = image.name;
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Selected: ${image.name}')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Error selecting image')),
        );
      }
    }
  }

  Future<void> _register() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_idCardPath == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please upload your ID/Passport card')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final String token = await AuthService().registerRider(
        _nameController.text,
        _emailController.text,
        _phoneController.text,
        _idNumberController.text,
        _motorcyclePlateNumberController.text,
        _passwordController.text,
        idCardUrl: _idCardName, // In a real app, you would upload the file at _idCardPath to a storage service
      );
      if (mounted) {
        Provider.of<AuthProvider>(context, listen: false).saveToken(token);
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Rider registration successful!')),
        );
      }
    } on HttpException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message), backgroundColor: Colors.red));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Registration failed: ${e.toString()}'), backgroundColor: Colors.red));
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Register as Rider'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(labelText: 'Full Name', prefixIcon: Icon(Icons.person)),
                validator: (value) => value == null || value.isEmpty ? 'Please enter your full name' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(labelText: 'Email', prefixIcon: Icon(Icons.email)),
                validator: (value) => value == null || value.isEmpty || !value.contains('@') ? 'Please enter a valid email' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(labelText: 'Phone Number', prefixIcon: Icon(Icons.phone)),
                validator: (value) => value == null || value.isEmpty ? 'Please enter your phone number' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _idNumberController,
                decoration: const InputDecoration(labelText: 'National ID Number', prefixIcon: Icon(Icons.credit_card)),
                validator: (value) => value == null || value.isEmpty ? 'Please enter your ID number' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _motorcyclePlateNumberController,
                decoration: const InputDecoration(labelText: 'Motorcycle Plate Number', prefixIcon: Icon(Icons.two_wheeler)),
                validator: (value) => value == null || value.isEmpty ? 'Please enter your motorcycle plate number' : null,
              ),
              const SizedBox(height: 24),
              const Text('Upload ID/Passport Card', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              InkWell(
                onTap: _pickIdCard,
                child: Container(
                  height: 150,
                  decoration: BoxDecoration(
                    color: Colors.grey[200],
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.grey[400]!),
                  ),
                  child: _idCardName == null
                      ? const Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.cloud_upload, size: 40, color: Colors.grey),
                            Text('Tap to select file', style: TextStyle(color: Colors.grey)),
                          ],
                        )
                      : Center(
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.check_circle, color: Colors.green),
                              const SizedBox(width: 8),
                              Text(_idCardName!, style: const TextStyle(fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 24),
              TextFormField(
                controller: _passwordController,
                obscureText: _obscurePassword,
                decoration: InputDecoration(
                  labelText: 'Password', 
                  prefixIcon: const Icon(Icons.lock),
                  suffixIcon: IconButton(
                    icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility),
                    onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                  )
                ),
                validator: (value) => value == null || value.length < 6 ? 'Password must be at least 6 characters long' : null,
              ),
              const SizedBox(height: 24),
              _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : ElevatedButton(
                      onPressed: _register,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 15),
                        backgroundColor: Colors.black,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Complete Registration'),
                    ),
            ],
          ),
        ),
      ),
    );
  }
}
