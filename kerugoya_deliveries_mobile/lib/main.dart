import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:kerugoya_deliveries_mobile/screens/login_screen.dart';
import 'package:kerugoya_deliveries_mobile/screens/main_screen.dart';
import 'package:kerugoya_deliveries_mobile/screens/rider_main_screen.dart';
import 'package:kerugoya_deliveries_mobile/services/auth_provider.dart';
import 'package:kerugoya_deliveries_mobile/services/cart_provider.dart';
import 'package:kerugoya_deliveries_mobile/services/socket_service.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => CartProvider()),
        Provider(create: (_) => SocketService()),
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
            return const LoginScreen();
          }

          // Navigate based on role
          if (auth.userRole == 'RIDER') {
            return const RiderMainScreen();
          } else {
            return const MainScreen(userRole: 'CLIENT');
          }
        },
      ),
    );
  }
}
