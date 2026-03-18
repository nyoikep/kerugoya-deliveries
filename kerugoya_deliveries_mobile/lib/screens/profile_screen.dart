import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:kerugoya_deliveries_mobile/services/auth_provider.dart';
import 'package:jwt_decoder/jwt_decoder.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    Map<String, dynamic>? decodedToken;

    if (authProvider.token != null) {
      decodedToken = JwtDecoder.decode(authProvider.token!);
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
      ),
      body: authProvider.isAuthenticated && decodedToken != null
          ? Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Name: ${decodedToken['name'] ?? 'N/A'}', style: const TextStyle(fontSize: 18)),
                  const SizedBox(height: 8),
                  Text('Email: ${decodedToken['email'] ?? 'N/A'}', style: const TextStyle(fontSize: 18)),
                  const SizedBox(height: 8),
                  Text('Phone: ${decodedToken['phone'] ?? 'N/A'}', style: const TextStyle(fontSize: 18)),
                  const SizedBox(height: 8),
                  Text('Role: ${decodedToken['role'] ?? 'N/A'}', style: const TextStyle(fontSize: 18)),
                  if (decodedToken['role'] == 'RIDER') ...[
                    const SizedBox(height: 8),
                    Text('ID Number: ${decodedToken['idNumber'] ?? 'N/A'}', style: const TextStyle(fontSize: 18)),
                    const SizedBox(height: 8),
                    Text('Motorcycle Plate: ${decodedToken['motorcyclePlateNumber'] ?? 'N/A'}', style: const TextStyle(fontSize: 18)),
                  ],
                  const SizedBox(height: 32),
                  Center(
                    child: ElevatedButton(
                      onPressed: () {
                        authProvider.logout();
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red, // Background color
                        foregroundColor: Colors.white, // Text color
                        padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 15),
                        textStyle: const TextStyle(fontSize: 18),
                      ),
                      child: const Text('Logout'),
                    ),
                  ),
                ],
              ),
            )
          : const Center(
              child: Text('Please log in to view your profile.'),
            ),
    );
  }
}
