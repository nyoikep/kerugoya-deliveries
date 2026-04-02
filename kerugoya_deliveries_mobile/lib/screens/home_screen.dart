import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:kerugoya_deliveries_mobile/services/auth_provider.dart';
import 'package:kerugoya_deliveries_mobile/models/business.dart';
import 'package:kerugoya_deliveries_mobile/services/business_service.dart';
import 'package:kerugoya_deliveries_mobile/screens/login_screen.dart';
import 'package:kerugoya_deliveries_mobile/screens/checkout_screen.dart';
import 'package:kerugoya_deliveries_mobile/services/socket_service.dart';
import 'package:video_player/video_player.dart';

class HomeScreen extends StatefulWidget {
  final String userRole;
  final Function(int)? onNavigate;

  const HomeScreen({super.key, required this.userRole, this.onNavigate});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late VideoPlayerController _videoController;
  bool _isVideoInitialized = false;
  List<Business> _featuredBusinesses = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initVideo();
    _fetchFeatured();
  }

  void _initVideo() {
    _videoController = VideoPlayerController.asset('assets/5614377-hd_1920_1080_25fps.mp4')
      ..initialize().then((_) {
        setState(() { _isVideoInitialized = true; });
        _videoController.setLooping(true);
        _videoController.setVolume(0);
        _videoController.play();
      });
  }

  Future<void> _fetchFeatured() async {
    try {
      final businessService = Provider.of<BusinessService>(context, listen: false);
      final fetched = await businessService.getBusinesses();
      setState(() {
        _featuredBusinesses = fetched.take(5).toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() { _isLoading = false; });
    }
  }

  @override
  void dispose() {
    _videoController.dispose();
    super.dispose();
  }

  bool _checkAuth() {
    if (widget.userRole == 'GUEST') {
      Navigator.of(context).push(MaterialPageRoute(builder: (context) => const LoginScreen()));
      return false;
    }
    return true;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildUberHero(),
            _buildQuickActions(),
            _buildPromotionBanner(),
            _buildRideOptions(),
            _buildFeaturedSection(),
            _buildFooter(),
          ],
        ),
      ),
    );
  }

  Widget _buildUberHero() {
    return Stack(
      children: [
        Container(
          height: 300,
          width: double.infinity,
          child: _isVideoInitialized
              ? AspectRatio(
                  aspectRatio: _videoController.value.aspectRatio,
                  child: VideoPlayer(_videoController),
                )
              : Image.asset('assets/pexels-bruce-byereta-422939715-31961615.jpg', fit: BoxFit.cover),
        ),
        Container(
          height: 300,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Colors.black.withOpacity(0.3), Colors.white],
            ),
          ),
        ),
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Image.asset('assets/logo.jpg', height: 35),
                    if (widget.userRole != 'GUEST')
                      IconButton(
                        icon: const Icon(Icons.logout, color: Colors.white),
                        onPressed: () {
                          Provider.of<SocketService>(context, listen: false).reset();
                          Provider.of<AuthProvider>(context, listen: false).logout();
                        },
                      ),
                  ],
                ),
                const SizedBox(height: 40),
                const Text(
                  'Where to?',
                  style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.black),
                ),
                const SizedBox(height: 20),
                GestureDetector(
                  onTap: () {
                    if (_checkAuth()) {
                      Navigator.of(context).push(MaterialPageRoute(builder: (context) => const CheckoutScreen()));
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      borderRadius: BorderRadius.circular(30),
                      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 5))],
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.search, color: Colors.black, size: 28),
                        const SizedBox(width: 15),
                        Text('Enter destination', style: TextStyle(color: Colors.grey[600], fontSize: 18, fontWeight: FontWeight.w500)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 15),
                Row(
                  children: [
                    _buildNowLaterChip(Icons.access_time_filled, 'Now', true),
                    const SizedBox(width: 10),
                    _buildNowLaterChip(Icons.calendar_month, 'Schedule', false),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildNowLaterChip(IconData icon, String label, bool isActive) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: isActive ? Colors.black : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: isActive ? Colors.white : Colors.black),
          const SizedBox(width: 8),
          Text(label, style: TextStyle(color: isActive ? Colors.white : Colors.black, fontWeight: FontWeight.bold, fontSize: 13)),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _buildActionCard('Ride', Icons.directions_car, Colors.blue[100]!, 0),
          _buildActionCard('Package', Icons.inventory_2, Colors.green[100]!, 1),
          _buildActionCard('Shop', Icons.shopping_bag, Colors.orange[100]!, 1),
        ],
      ),
    );
  }

  Widget _buildActionCard(String label, IconData icon, Color color, int tab) {
    return InkWell(
      onTap: () {
        if (_checkAuth()) {
          if (tab == 0) {
            Navigator.of(context).push(MaterialPageRoute(builder: (context) => const CheckoutScreen()));
          } else {
            widget.onNavigate?.call(tab);
          }
        }
      },
      child: Container(
        width: 100,
        padding: const EdgeInsets.all(15),
        decoration: BoxDecoration(
          color: color.withOpacity(0.3),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Column(
          children: [
            Icon(icon, size: 32, color: Colors.black87),
            const SizedBox(height: 10),
            Text(label, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14)),
          ],
        ),
      ),
    );
  }

  Widget _buildPromotionBanner() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.blue[600],
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Try Kerugoya Plus', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900)),
                SizedBox(height: 5),
                Text('Get priority pickups and exclusive discounts.', style: TextStyle(color: Colors.white70, fontSize: 13)),
              ],
            ),
          ),
          const SizedBox(width: 10),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: Colors.blue[600], shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
            child: const Text('JOIN', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildRideOptions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.fromLTRB(20, 30, 20, 10),
          child: Text('Suggested for you', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
        ),
        _buildOptionItem(Icons.bolt, 'Pick up now', 'Fastest way to get a ride', 'From \$5.00'),
        _buildOptionItem(Icons.group, 'Ride Share', 'Save up to 40% on your trip', 'From \$3.50'),
        _buildOptionItem(Icons.star, 'Premium', 'Top rated drivers & luxury cars', 'From \$12.00'),
      ],
    );
  }

  Widget _buildOptionItem(IconData icon, String title, String sub, String price) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(color: Colors.grey[100], borderRadius: BorderRadius.circular(10)),
        child: Icon(icon, color: Colors.black),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
      subtitle: Text(sub, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
      trailing: Text(price, style: const TextStyle(fontWeight: FontWeight.bold)),
      onTap: () {
        if (_checkAuth()) {
          Navigator.of(context).push(MaterialPageRoute(builder: (context) => const CheckoutScreen()));
        }
      },
    );
  }

  Widget _buildFeaturedSection() {
    if (_isLoading) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.fromLTRB(20, 30, 20, 15),
          child: Text('Top Rated Businesses', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
        ),
        SizedBox(
          height: 180,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: _featuredBusinesses.length,
            itemBuilder: (context, index) {
              final b = _featuredBusinesses[index];
              return Container(
                width: 150,
                margin: const EdgeInsets.only(right: 15),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      height: 100,
                      decoration: BoxDecoration(
                        color: Colors.grey[200],
                        borderRadius: BorderRadius.circular(20),
                        image: const DecorationImage(image: AssetImage('assets/logo.jpg'), fit: BoxFit.cover, opacity: 0.2),
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(b.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14), maxLines: 1, overflow: TextOverflow.ellipsis),
                    Text(b.category, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildFooter() {
    return Container(
      padding: const EdgeInsets.all(40),
      color: Colors.black,
      width: double.infinity,
      child: Column(
        children: [
          const Text('KERUGOYA', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900, letterSpacing: 2)),
          const SizedBox(height: 20),
          Text(
            '© 2026 Kerugoya Deliveries. All rights reserved.',
            style: TextStyle(color: Colors.grey[600], fontSize: 11),
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildFooterLink('Terms'),
              const Text(' • ', style: TextStyle(color: Colors.grey)),
              _buildFooterLink('Privacy'),
              const Text(' • ', style: TextStyle(color: Colors.grey)),
              _buildFooterLink('Safety'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFooterLink(String text) {
    return Text(text, style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold));
  }
}
