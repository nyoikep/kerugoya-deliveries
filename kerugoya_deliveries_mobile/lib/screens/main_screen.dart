import 'package:flutter/material.dart';
import 'package:kerugoya_deliveries_mobile/screens/home_screen.dart';
import 'package:kerugoya_deliveries_mobile/screens/cart_screen.dart';
import 'package:kerugoya_deliveries_mobile/screens/profile_screen.dart';
import 'package:kerugoya_deliveries_mobile/screens/delivery_tracking_screen.dart';
import 'package:kerugoya_deliveries_mobile/screens/delivery_history_screen.dart';
import 'package:kerugoya_deliveries_mobile/screens/login_screen.dart';

class MainScreen extends StatefulWidget {
  final String userRole; // Add userRole parameter

  const MainScreen({super.key, required this.userRole});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;

  // _widgetOptions will now use widget.userRole
  late final List<Widget> _widgetOptions;

  @override
  void initState() {
    super.initState();
    _widgetOptions = <Widget>[
      HomeScreen(userRole: widget.userRole),
      const CartScreen(),
      widget.userRole == 'GUEST' ? _buildGuestAccessPrompt('Tracking') : const DeliveryTrackingScreen(),
      widget.userRole == 'GUEST' ? _buildGuestAccessPrompt('History') : const DeliveryHistoryScreen(),
      widget.userRole == 'GUEST' ? _buildGuestAccessPrompt('Profile') : const ProfileScreen(),
    ];
  }

  Widget _buildGuestAccessPrompt(String featureName) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.lock_outline, size: 64, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text(
            'Please log in to view $featureName',
            style: const TextStyle(fontSize: 18, color: Colors.grey),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (context) => const LoginScreen()),
              );
            },
            child: const Text('Go to Login'),
          ),
        ],
      ),
    );
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: _widgetOptions.elementAt(_selectedIndex),
      ),
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.shopping_cart),
            label: 'Cart',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.delivery_dining),
            label: 'Tracking',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.history),
            label: 'History',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.amber[800],
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed,
        onTap: _onItemTapped,
      ),
    );
  }
}
