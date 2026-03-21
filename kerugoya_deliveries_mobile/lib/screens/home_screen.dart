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

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
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
                ],
              ),
            ),
    );
  }

  Widget _buildAppBar() {
    return SliverAppBar(
      floating: true,
      pinned: true,
      title: const Text('Kerugoya Deliveries', style: TextStyle(fontWeight: FontWeight.bold)),
      actions: [
        if (widget.userRole == 'GUEST')
          TextButton.icon(
            onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (context) => const LoginScreen())),
            icon: const Icon(Icons.login, color: Colors.orange),
            label: const Text('Login', style: TextStyle(color: Colors.orange)),
          )
        else
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => Provider.of<AuthProvider>(context, listen: false).logout(),
          ),
      ],
    );
  }

  Widget _buildHeroSection() {
    return Container(
      height: 200,
      width: double.infinity,
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        image: const DecorationImage(
          image: AssetImage('assets/logo.jpg'), // Using available logo as placeholder hero
          fit: BoxFit.cover,
          colorFilter: ColorFilter.mode(Colors.black45, BlendMode.darken),
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text(
            'Go Anywhere with Kerugoya',
            style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          const Text(
            'Request a ride, order a delivery.',
            style: TextStyle(color: Colors.white70, fontSize: 16),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.orange, foregroundColor: Colors.white),
            onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (context) => const CheckoutScreen())),
            child: const Text('Request a Ride Now'),
          ),
        ],
      ),
    );
  }

  Widget _buildCategorySelector() {
    return SizedBox(
      height: 50,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: _categories.length,
        itemBuilder: (context, index) {
          final cat = _categories[index];
          final isSelected = _selectedCategory == cat;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ChoiceChip(
              label: Text(cat),
              selected: isSelected,
              onSelected: (val) => setState(() => _selectedCategory = cat),
              selectedColor: Colors.orange,
              labelStyle: TextStyle(color: isSelected ? Colors.white : Colors.black),
            ),
          );
        },
      ),
    );
  }

  Widget _buildBusinessSection(Business business) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
          child: Row(
            children: [
              const Icon(Icons.store, color: Colors.orange),
              const SizedBox(width: 8),
              Text(
                business.name,
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const Spacer(),
              if (business.category == 'SERVICE')
                const Chip(label: Text('SERVICE', style: TextStyle(fontSize: 10)), backgroundColor: Colors.blueScale),
            ],
          ),
        ),
        if (business.description != null)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(business.description!, style: TextStyle(color: Colors.grey[600])),
          ),
        const SizedBox(height: 12),
        SizedBox(
          height: 180,
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
      width: 160,
      margin: const EdgeInsets.only(right: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [
          BoxShadow(color: Colors.grey.withOpacity(0.1), blurRadius: 10, offset: const Offset(0, 5)),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              product.name,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Text(
              product.description ?? '',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(fontSize: 12, color: Colors.grey[600]),
            ),
            const Spacer(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Ksh ${product.price.toInt()}',
                  style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green),
                ),
                IconButton(
                  icon: Icon(isService ? Icons.arrow_forward : Icons.add_shopping_cart, size: 20, color: Colors.orange),
                  onPressed: () {
                    if (isService) {
                       Navigator.of(context).push(MaterialPageRoute(builder: (context) => const CheckoutScreen()));
                    } else {
                      cart.addItem(product);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('${product.name} added to cart!'), duration: const Duration(seconds: 1)),
                      );
                    }
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
extension on Colors {
  static const Color blueScale = Color(0xFFE3F2FD);
}
