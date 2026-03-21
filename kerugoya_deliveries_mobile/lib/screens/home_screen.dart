import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:kerugoya_deliveries_mobile/services/auth_provider.dart';
import 'package:kerugoya_deliveries_mobile/services/api_service.dart';
import 'package:kerugoya_deliveries_mobile/models/product.dart';
import 'package:kerugoya_deliveries_mobile/models/business.dart';
import 'package:kerugoya_deliveries_mobile/services/business_service.dart';
import 'package:kerugoya_deliveries_mobile/services/cart_provider.dart';
import 'package:kerugoya_deliveries_mobile/screens/login_screen.dart';
import 'package:kerugoya_deliveries_mobile/screens/checkout_screen.dart';
import 'package:video_player/video_player.dart';

class HomeScreen extends StatefulWidget {
  final String userRole;

  const HomeScreen({super.key, required this.userRole});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Business> _businesses = [];
  bool _isLoading = true;
  String? _error;
  String _selectedCategory = 'All';
  late VideoPlayerController _videoController;
  bool _isVideoInitialized = false;

  @override
  void initState() {
    super.initState();
    _fetchData();
    _initVideo();
  }

  void _initVideo() {
    _videoController = VideoPlayerController.asset('assets/5614377-hd_1920_1080_25fps.mp4')
      ..initialize().then((_) {
        setState(() {
          _isVideoInitialized = true;
        });
        _videoController.setLooping(true);
        _videoController.setVolume(0);
        _videoController.play();
      });
  }

  @override
  void dispose() {
    _videoController.dispose();
    super.dispose();
  }

  Future<void> _fetchData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final businessService = Provider.of<BusinessService>(context, listen: false);
      final fetchedBusinesses = await businessService.getBusinesses();
      setState(() {
        _businesses = fetchedBusinesses;
        _isLoading = false;
      });
    } on HttpException catch (e) {
      setState(() {
        _error = e.message;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load data: ${e.toString()}';
        _isLoading = false;
      });
    }
  }

  List<String> get _categories {
    final cats = _businesses.map((b) => b.category).toSet().toList();
    cats.sort();
    return ['All', ...cats];
  }

  List<Business> get _filteredBusinesses {
    if (_selectedCategory == 'All') return _businesses;
    return _businesses.where((b) => b.category == _selectedCategory).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchData,
              child: CustomScrollView(
                slivers: [
                  _buildAppBar(),
                  SliverToBoxAdapter(child: _buildHeroSection()),
                  SliverToBoxAdapter(child: _buildCategorySelector()),
                  if (_error != null)
                    SliverFillRemaining(child: Center(child: Text('Error: $_error')))
                  else if (_businesses.isEmpty)
                    const SliverFillRemaining(child: Center(child: Text('No businesses available.')))
                  else
                    SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final business = _filteredBusinesses[index];
                          return _buildBusinessSection(business);
                        },
                        childCount: _filteredBusinesses.length,
                      ),
                    ),
                  const SliverToBoxAdapter(child: SizedBox(height: 100)),
                ],
              ),
            ),
    );
  }

  Widget _buildAppBar() {
    return SliverAppBar(
      floating: true,
      pinned: true,
      expandedHeight: 0,
      backgroundColor: Colors.white,
      elevation: 0,
      title: Image.asset('assets/logo.jpg', height: 40),
      centerTitle: true,
      actions: [
        if (widget.userRole == 'GUEST')
          IconButton(
            onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (context) => const LoginScreen())),
            icon: const Icon(Icons.person_outline, color: Colors.black),
          )
        else
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.black),
            onPressed: () => Provider.of<AuthProvider>(context, listen: false).logout(),
          ),
      ],
    );
  }

  Widget _buildHeroSection() {
    return Stack(
      children: [
        Container(
          height: 300,
          width: double.infinity,
          decoration: const BoxDecoration(
            color: Colors.black,
          ),
          child: _isVideoInitialized
              ? AspectRatio(
                  aspectRatio: _videoController.value.aspectRatio,
                  child: VideoPlayer(_videoController),
                )
              : Image.asset(
                  'assets/pexels-bruce-byereta-422939715-31961615.jpg',
                  fit: BoxFit.cover,
                ),
        ),
        Container(
          height: 300,
          width: double.infinity,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Colors.black.withOpacity(0.3),
                Colors.black.withOpacity(0.7),
              ],
            ),
          ),
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.end,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Go Anywhere with Kerugoya',
                style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'Request a ride, order a delivery. Your city is in your hands.',
                style: TextStyle(color: Colors.white70, fontSize: 18),
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (context) => const CheckoutScreen())),
                      child: const Text('Ride', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.orange,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () {
                         setState(() {
                           _selectedCategory = 'All';
                         });
                         // Scroll down or just focus on products
                      },
                      child: const Text('Shop', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCategorySelector() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Row(
          children: _categories.map((cat) {
            final isSelected = _selectedCategory == cat;
            return Padding(
              padding: const EdgeInsets.only(right: 12),
              child: GestureDetector(
                onTap: () => setState(() => _selectedCategory = cat),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  decoration: BoxDecoration(
                    color: isSelected ? Colors.black : Colors.grey[200],
                    borderRadius: BorderRadius.circular(25),
                  ),
                  child: Text(
                    cat,
                    style: TextStyle(
                      color: isSelected ? Colors.white : Colors.black,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildBusinessSection(Business business) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 24, 16, 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                business.name,
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              if (business.description != null)
                Text(
                  business.description!,
                  style: TextStyle(color: Colors.grey[600], fontSize: 14),
                ),
            ],
          ),
        ),
        SizedBox(
          height: 240,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: business.products.length,
            itemBuilder: (context, index) {
              final product = business.products[index];
              return _buildProductCard(product, business.category == 'SERVICE');
            },
          ),
        ),
      ],
    );
  }

  Widget _buildProductCard(Product product, bool isService) {
    final cart = Provider.of<CartProvider>(context, listen: false);
    return Container(
      width: 200,
      margin: const EdgeInsets.only(right: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 15, offset: const Offset(0, 8)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 120,
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
              image: const DecorationImage(
                image: AssetImage('assets/logo.jpg'),
                fit: BoxFit.cover,
                opacity: 0.3,
              ),
            ),
            child: Center(
              child: Icon(
                isService ? Icons.bike_scooter : Icons.shopping_bag_outlined,
                size: 40,
                color: Colors.orange,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                Text(
                  'Ksh ${product.price.toInt()}',
                  style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.orange, fontSize: 14),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.black,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(vertical: 0),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    onPressed: () {
                      if (isService) {
                         Navigator.of(context).push(MaterialPageRoute(builder: (context) => const CheckoutScreen()));
                      } else {
                        cart.addItem(product);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('${product.name} added to cart'),
                            behavior: SnackBarBehavior.floating,
                            duration: const Duration(seconds: 1),
                          ),
                        );
                      }
                    },
                    child: Text(isService ? 'Request' : 'Add to Cart', style: const TextStyle(fontSize: 12)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
