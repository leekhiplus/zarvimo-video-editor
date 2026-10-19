# Zafronix Video Editor Proguard Rules
-keepattributes *Annotation*
-keepclassmembers class * {
    @androidx.media3.common.util.UnstableApi <methods>;
}
-keep class com.zafronix.videoeditor.data.model.** { *; }
