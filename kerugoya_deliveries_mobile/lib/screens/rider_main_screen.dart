import 'package:flutter/material.dart';
import 'package:kerugoya_deliveries_mobile/screens/rider_home_screen.dart'; // Import RiderHomeScreen
import 'package:kerugoya_deliveries_mobile/screens/rider_deliveries_screen.dart'; // Import RiderDeliveriesScreen
import 'package:kerugoya_deliveries_mobile/screens/rider_profile_screen.dart'; // Import RiderProfileScreen

class RiderMainScreen extends StatefulWidget {
  const RiderMainScreen({super.key});

  @override
  State<RiderMainScreen> createState() => _RiderMainScreenState();
}

class _RiderMainScreenState extends State<RiderMainScreen> {
  int _selectedIndex = 0;

  static const List<Widget> _riderWidgetOptions = <Widget>[
    RiderHomeScreen(),
    RiderDeliveriesScreen(),
    RiderProfileScreen(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center( // Wrap with Center to ensure content is always centered within the body
        child: _riderWidgetOptions.elementAt(_selectedIndex),
      ),
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.delivery_dining),
            label: 'My Deliveries', // Updated label
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.amber[800],
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed, // Added type for consistent display
        onTap: _onItemTapped,
      ),
    );
  }
}
