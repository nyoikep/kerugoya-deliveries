import 'package:kerugoya_deliveries_mobile/services/api_service.dart';
import 'package:kerugoya_deliveries_mobile/services/auth_provider.dart';

class Rider {
  final String id;
  final String name;
  final String phone;
  final String motorcyclePlateNumber;

  Rider({
    required this.id,
    required this.name,
    required this.phone,
    required this.motorcyclePlateNumber,
  });

  factory Rider.fromJson(Map<String, dynamic> json) {
    return Rider(
      id: json['id'],
      name: json['name'],
      phone: json['phone'],
      motorcyclePlateNumber: json['motorcyclePlateNumber'] ?? 'N/A',
    );
  }
}

class RiderService {
  final AuthProvider _authProvider;

  RiderService(this._authProvider);

  Future<List<Rider>> getAvailableRiders() async {
    try {
      final response = await ApiService.get(
        'riders',
        token: _authProvider.token,
      );

      if (response is List) {
        return (response as List)
            .map((item) => Rider.fromJson(item))
            .toList();
      } else {
        return _getMockRiders();
      }
    } catch (e) {
      print('Error fetching riders, using mock data: $e');
      return _getMockRiders();
    }
  }

  List<Rider> _getMockRiders() {
    return [
      Rider(id: 'r1', name: 'James Boda', phone: '+254 711 000 111', motorcyclePlateNumber: 'KMCE 123A'),
      Rider(id: 'r2', name: 'Sarah Deliveries', phone: '+254 722 000 222', motorcyclePlateNumber: 'KMCG 456B'),
      Rider(id: 'r3', name: 'Mike Fast', phone: '+254 733 000 333', motorcyclePlateNumber: 'KMCH 789C'),
    ];
  }
}
