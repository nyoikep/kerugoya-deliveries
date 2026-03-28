import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:kerugoya_deliveries_mobile/screens/home_screen.dart';
import 'package:kerugoya_deliveries_mobile/screens/shop_screen.dart';
import 'package:kerugoya_deliveries_mobile/screens/cart_screen.dart';
import 'package:kerugoya_deliveries_mobile/screens/profile_screen.dart';
import 'package:kerugoya_deliveries_mobile/screens/delivery_tracking_screen.dart';
import 'package:kerugoya_deliveries_mobile/screens/delivery_history_screen.dart';
import 'package:kerugoya_deliveries_mobile/screens/login_screen.dart';
import 'package:kerugoya_deliveries_mobile/screens/more_screen.dart';
import 'package:kerugoya_deliveries_mobile/services/cart_provider.dart';

class MainScreen extends StatefulWidget {
  final String userRole;

  const MainScreen({super.key, required this.userRole});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;

  late List<Widget> _widgetOptions;

  @override
  void initState() {
    super.initState();
    _updateWidgetOptions();
  }

  void _updateWidgetOptions() {
    _widgetOptions = <Widget>[
      HomeScreen(
        userRole: widget.userRole,
        onNavigate: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
      ),
      const ShopScreen(),
      const CartScreen(),
      if (widget.userRole != 'GUEST') ...[
        const DeliveryTrackingScreen(),
        const DeliveryHistoryScreen(),
      ],
      MoreScreen(onNavigate: (index) {
        setState(() {
          _selectedIndex = index;
        });
      }),
    ];
  }

  void _onItemTapped(int index) {
    if (widget.userRole == 'GUEST' && (index == 3 || index == 4)) {
       // Should not happen with new logic but for safety
       Navigator.of(context).push(MaterialPageRoute(builder: (context) => const LoginScreen()));
       return;
    }
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    _updateWidgetOptions(); 
    final cart = Provider.of<CartProvider>(context);

    return Scaffold(
      body: IndexedStack(
        index: _selectedIndex,
        children: _widgetOptions,
      ),
      bottomNavigationBar: BottomNavigationBar(
        items: [
          const BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Home',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.storefront_outlined),
            activeIcon: Icon(Icons.storefront),
            label: 'Shop',
          ),
          BottomNavigationBarItem(
            icon: cart.itemCount > 0 
              ? Badge(
                  label: Text(cart.itemCount.toString()),
                  child: const Icon(Icons.shopping_cart_outlined),
                )
              : const Icon(Icons.shopping_cart_outlined),
            activeIcon: cart.itemCount > 0 
              ? Badge(
                  label: Text(cart.itemCount.toString()),
                  child: const Icon(Icons.shopping_cart),
                )
              : const Icon(Icons.shopping_cart),
            label: 'Cart',
          ),
          if (widget.userRole != 'GUEST') ...[
            const BottomNavigationBarItem(
              icon: Icon(Icons.delivery_dining_outlined),
              activeIcon: Icon(Icons.delivery_dining),
              label: 'Tracking',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.history_outlined),
              activeIcon: Icon(Icons.history),
              label: 'History',
            ),
          ],
          const BottomNavigationBarItem(
            icon: Icon(Icons.more_horiz_outlined),
            activeIcon: Icon(Icons.more_horiz),
            label: 'More',
          ),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.black,
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed,
        selectedFontSize: 12,
        unselectedFontSize: 12,
        onTap: _onItemTapped,
      ),
    );
  }
}
