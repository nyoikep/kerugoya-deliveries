import 'package:flutter/material.dart';
import 'package:kerugoya_deliveries_mobile/screens/login_screen.dart';
import 'package:provider/provider.dart';
import 'package:kerugoya_deliveries_mobile/services/auth_provider.dart';

class MoreScreen extends StatelessWidget {
  final Function(int)? onNavigate;

  const MoreScreen({super.key, this.onNavigate});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final isLoggedIn = auth.isAuthenticated;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('More', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: ListView(
        children: [
          if (isLoggedIn) ...[
            _buildSectionHeader('Services'),
            _buildListTile(Icons.storefront, 'Shop Products', () {
              if (onNavigate != null) onNavigate!(1);
            }),
            _buildListTile(Icons.delivery_dining, 'Order Delivery / Request a Ride', () {
               if (onNavigate != null) onNavigate!(0); // Home then they can request a ride
            }),
          ],

          _buildSectionHeader('Support & Info'),
          _buildListTile(Icons.info_outline, 'About Kerugoya Deliveries', () {
             _showAboutDialog(context);
          }),
          _buildListTile(Icons.contact_support_outlined, 'Contact Support', () {
             _showContactDialog(context);
          }),
          _buildListTile(Icons.description_outlined, 'Terms of Service', () {}),
          _buildListTile(Icons.privacy_tip_outlined, 'Privacy Policy', () {}),
          
          if (isLoggedIn) ...[
            _buildSectionHeader('Account'),
            _buildListTile(Icons.logout, 'Log Out', () {
              auth.logout();
            }, color: Colors.red),
          ] else ...[
            _buildSectionHeader('Account'),
            _buildListTile(Icons.login, 'Log In', () {
              Navigator.of(context).push(MaterialPageRoute(builder: (context) => const LoginScreen()));
            }, color: Colors.black),
          ],
          
          const SizedBox(height: 40),
          Center(
            child: Text(
              'v1.0.0 (v2.3)',
              style: TextStyle(color: Colors.grey[400], fontSize: 10),
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
      child: Text(
        title.toUpperCase(),
        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey),
      ),
    );
  }

  Widget _buildListTile(IconData icon, String title, VoidCallback onTap, {Color color = Colors.black}) {
    return ListTile(
      leading: Icon(icon, color: color),
      title: Text(title, style: TextStyle(color: color, fontWeight: FontWeight.w500)),
      trailing: const Icon(Icons.chevron_right, size: 20, color: Colors.grey),
      onTap: onTap,
    );
  }

  void _showAboutDialog(BuildContext context) {
    showAboutDialog(
      context: context,
      applicationName: 'Kerugoya Deliveries',
      applicationVersion: '1.0.0',
      applicationLegalese: '© 2026 Peter Maina. All rights reserved.',
      children: [
        const Padding(
          padding: EdgeInsets.only(top: 15),
          child: Text('Kerugoya Deliveries is your premium partner for home and office deliveries in Kerugoya. We bridge the gap between local businesses and customers through fast, reliable, and secure logistics.'),
        ),
      ],
    );
  }

  void _showContactDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Contact Us'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Email: support@kerugoyadeliveries.com'),
            SizedBox(height: 8),
            Text('Phone: +254 700 000 000'),
            SizedBox(height: 8),
            Text('Address: Kerugoya Town, Kenya'),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close')),
        ],
      ),
    );
  }
}
