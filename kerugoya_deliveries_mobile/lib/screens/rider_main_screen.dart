import 'package:flutter/material.dart';
import 'package:kerugoya_deliveries_mobile/screens/rider_home_screen.dart';
import 'package:kerugoya_deliveries_mobile/screens/rider_deliveries_screen.dart';
import 'package:kerugoya_deliveries_mobile/screens/rider_profile_screen.dart';
import 'package:kerugoya_deliveries_mobile/services/socket_service.dart';
import 'package:provider/provider.dart';
import 'package:kerugoya_deliveries_mobile/services/auth_provider.dart';

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
    final auth = Provider.of<AuthProvider>(context);
    
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Text('Rider Portal', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(color: Colors.blue[100], borderRadius: BorderRadius.circular(5)),
              child: const Text('RIDER', style: TextStyle(fontSize: 10, color: Colors.blue, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout), 
            onPressed: () {
              Provider.of<SocketService>(context, listen: false).reset();
              auth.logout();
            }
          ),
        ],
      ),
      body: _riderWidgetOptions.elementAt(_selectedIndex),
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.delivery_dining), label: 'Active'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
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
