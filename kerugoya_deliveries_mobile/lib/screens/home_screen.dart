import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:kerugoya_deliveries_mobile/services/auth_provider.dart';
import 'package:kerugoya_deliveries_mobile/models/business.dart';
import 'package:kerugoya_deliveries_mobile/services/business_service.dart';
import 'package:kerugoya_deliveries_mobile/screens/login_screen.dart';
import 'package:kerugoya_deliveries_mobile/screens/checkout_screen.dart';
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeroSection(),
            _buildQuickActions(),
            _buildFeaturedSection(),
            _buildPromotions(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeroSection() {
    return Stack(
      children: [
        Container(
          height: 450,
          width: double.infinity,
          foregroundDecoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Colors.black.withOpacity(0.1),
                Colors.black.withOpacity(0.8),
              ],
            ),
          ),
          child: _isVideoInitialized
              ? AspectRatio(
                  aspectRatio: _videoController.value.aspectRatio,
                  child: VideoPlayer(_videoController),
                )
              : Image.asset('assets/pexels-bruce-byereta-422939715-31961615.jpg', fit: BoxFit.cover),
        ),
        Positioned(
          bottom: 40,
          left: 20,
          right: 20,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Go Anywhere with\nKerugoya',
                style: TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.bold, height: 1.1),
              ),
              const SizedBox(height: 12),
              const Text(
                'Request a ride, order a delivery.\nYour city is in your hands.',
                style: TextStyle(color: Colors.white70, fontSize: 18),
              ),
              const SizedBox(height: 30),
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(15),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: InkWell(
                        onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (context) => const CheckoutScreen())),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 15),
                          decoration: BoxDecoration(
                            color: Colors.black,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Center(child: Text('Request a Ride', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                        ),
                      ),
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: InkWell(
                        onTap: () {
                           if (widget.onNavigate != null) widget.onNavigate!(1);
                        },
                        child: const Center(child: Text('Order Delivery', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold))),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Image.asset('assets/logo.jpg', height: 40),
                if (widget.userRole == 'GUEST')
                  CircleAvatar(
                    backgroundColor: Colors.white,
                    child: IconButton(
                      icon: const Icon(Icons.person_outline, color: Colors.black),
                      onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (context) => const LoginScreen())),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildQuickActions() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('What can we help you find?', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildActionItem(Icons.bike_scooter, 'Ride', Colors.green[50]!, Colors.green, 0),
              _buildActionItem(Icons.restaurant, 'Food', Colors.orange[50]!, Colors.orange, 1),
              _buildActionItem(Icons.shopping_basket, 'Grocery', Colors.blue[50]!, Colors.blue, 1),
              _buildActionItem(Icons.more_horiz, 'More', Colors.grey[100]!, Colors.black54, 1),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionItem(IconData icon, String label, Color bg, Color iconColor, int targetTab) {
    return InkWell(
      onTap: () {
        if (targetTab == 0) {
           Navigator.of(context).push(MaterialPageRoute(builder: (context) => const CheckoutScreen()));
        } else {
           if (widget.onNavigate != null) widget.onNavigate!(targetTab);
        }
      },
      child: Column(
        children: [
          Container(
            width: 70,
            height: 70,
            decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(15)),
            child: Icon(icon, color: iconColor, size: 30),
          ),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  Widget _buildFeaturedSection() {
    if (_isLoading) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
          child: Text('Featured near you', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        ),
        SizedBox(
          height: 200,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: _featuredBusinesses.length,
            itemBuilder: (context, index) {
              final b = _featuredBusinesses[index];
              return InkWell(
                onTap: () {
                  if (widget.onNavigate != null) widget.onNavigate!(1);
                },
                child: Container(
                  width: 280,
                  margin: const EdgeInsets.only(right: 12),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(15),
                    image: const DecorationImage(
                      image: AssetImage('assets/logo.jpg'),
                      fit: BoxFit.cover,
                      opacity: 0.1,
                    ),
                    border: Border.all(color: Colors.grey[200]!),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Text(b.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        Text(b.category, style: TextStyle(color: Colors.grey[600])),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildPromotions() {
    return Container(
      margin: const EdgeInsets.all(20),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Get 50% off your\nfirst delivery!', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 10),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: Colors.black),
                  onPressed: () {
                     if (widget.onNavigate != null) widget.onNavigate!(1);
                  },
                  child: const Text('Claim Now'),
                ),
              ],
            ),
          ),
          const Icon(Icons.card_giftcard, color: Colors.orange, size: 60),
        ],
      ),
    );
  }
}
