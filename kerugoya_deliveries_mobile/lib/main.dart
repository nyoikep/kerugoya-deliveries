import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:kerugoya_deliveries_mobile/screens/login_screen.dart';
import 'package:kerugoya_deliveries_mobile/screens/main_screen.dart';
import 'package:kerugoya_deliveries_mobile/screens/rider_main_screen.dart';
import 'package:kerugoya_deliveries_mobile/screens/admin_main_screen.dart';
import 'package:kerugoya_deliveries_mobile/services/auth_provider.dart';
import 'package:kerugoya_deliveries_mobile/services/cart_provider.dart';
import 'package:kerugoya_deliveries_mobile/services/socket_service.dart';
import 'package:kerugoya_deliveries_mobile/services/product_service.dart';
import 'package:kerugoya_deliveries_mobile/services/delivery_service.dart';
import 'package:kerugoya_deliveries_mobile/services/mpesa_service.dart';
import 'package:kerugoya_deliveries_mobile/services/rider_service.dart';
import 'package:kerugoya_deliveries_mobile/services/business_service.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => CartProvider()),
        ChangeNotifierProvider(create: (_) => SocketService()),
        ProxyProvider<AuthProvider, ProductService>(
          update: (_, auth, __) => ProductService(auth),
        ),
        ProxyProvider<AuthProvider, DeliveryService>(
          update: (_, auth, __) => DeliveryService(auth),
        ),
        ProxyProvider<AuthProvider, MpesaService>(
          update: (_, auth, __) => MpesaService(auth),
        ),
        ProxyProvider<AuthProvider, RiderService>(
          update: (_, auth, __) => RiderService(auth),
        ),
        ProxyProvider<AuthProvider, BusinessService>(
          update: (_, auth, __) => BusinessService(auth),
        ),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Kerugoya Deliveries',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.orange,
        useMaterial3: true,
        scaffoldBackgroundColor: Colors.white,
      ),
      home: Consumer<AuthProvider>(
        builder: (context, auth, _) {
          if (!auth.isAuthenticated) {
            return const MainScreen(userRole: 'GUEST');
          }

          // Navigate based on role
          if (auth.userRole == 'RIDER') {
            return const RiderMainScreen();
          } else if (auth.userRole == 'ADMIN') {
            return const AdminMainScreen();
          } else {
            return const MainScreen(userRole: 'CLIENT');
          }
        },
      ),
    );
  }
}
