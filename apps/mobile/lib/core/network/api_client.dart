import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

const String baseUrl = 'https://your-api-url.com/api';

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: const Duration(seconds: 30),
    receiveTimeout: const Duration(seconds: 30),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  ));

  dio.interceptors.add(AuthInterceptor(ref));
  dio.interceptors.add(LogInterceptor(
    requestBody: true,
    responseBody: true,
  ));

  return dio;
});

class AuthInterceptor extends Interceptor {
  final Ref ref;
  final _storage = const FlutterSecureStorage();

  AuthInterceptor(this.ref);

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _storage.read(key: 'auth_token');
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.response?.statusCode == 401) {
      // Handle token expiration
      _storage.delete(key: 'auth_token');
    }
    handler.next(err);
  }
}

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(ref.watch(dioProvider));
});

class ApiClient {
  final Dio _dio;

  ApiClient(this._dio);

  Future<Map<String, dynamic>> get(String path,
      {Map<String, dynamic>? queryParameters}) async {
    final response = await _dio.get(path, queryParameters: queryParameters);
    return response.data;
  }

  Future<Map<String, dynamic>> post(String path,
      {Map<String, dynamic>? data}) async {
    final response = await _dio.post(path, data: data);
    return response.data;
  }

  Future<Map<String, dynamic>> put(String path,
      {Map<String, dynamic>? data}) async {
    final response = await _dio.put(path, data: data);
    return response.data;
  }

  Future<Map<String, dynamic>> delete(String path) async {
    final response = await _dio.delete(path);
    return response.data;
  }
}

