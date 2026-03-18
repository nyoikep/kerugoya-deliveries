class User {
  final String id;
  final String email;
  final String phone;
  final String name;
  final String role;
  final String? idNumber; // Optional for riders

  User({
    required this.id,
    required this.email,
    required this.phone,
    required this.name,
    required this.role,
    this.idNumber,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      email: json['email'],
      phone: json['phone'],
      name: json['name'],
      role: json['role'],
      idNumber: json['idNumber'],
    );
  }
}
