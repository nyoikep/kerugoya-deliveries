# Flutter Proguard Rules
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }

# Keep models to avoid serialization issues
-keep class com.example.kerugoya_deliveries_mobile.models.** { *; }

# Ignore missing Play Core classes often caused by Flutter embedding
-dontwarn com.google.android.play.core.**
-dontwarn io.flutter.embedding.engine.deferredcomponents.**

# Standard Proguard rules for common libraries
-keepattributes Signature,Exceptions,*Annotation*
