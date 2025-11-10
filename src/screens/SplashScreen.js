import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';

const { width: screenWidth } = Dimensions.get('window');

const SplashScreen = ({ onAnimationComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create parallel animations
    const animations = [
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // Scale up
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      // Slide up
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // Glow effect
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1200,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // Progress bar (without native driver)
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: false, // Important: no native driver for width animation
      }),
    ];

    // Start animations
    Animated.parallel(animations).start();

    // Move to next screen after animation
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 2500); // 2.5 seconds total

    return () => clearTimeout(timer);
  }, []);

  const glowInterpolate = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0px', '15px'],
  });

  // Progress bar width interpolation (without native driver)
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Animated LalVault Logo */}
      <Animated.View 
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim }
            ]
          }
        ]}
      >
        {/* Outer Glow */}
        <Animated.View 
          style={[
            styles.glowEffect,
            {
              shadowOpacity: glowAnim,
              shadowRadius: glowInterpolate,
            }
          ]}
        />
        
        {/* Main Logo */}
        <View style={styles.logo}>
          <View style={styles.vaultDoor}>
            <View style={styles.doorFrame}>
              <View style={styles.doorPanel}>
                <View style={styles.doorHandle} />
                <View style={styles.lockCircle}>
                  <View style={styles.lockCore} />
                </View>
                <Text style={styles.brandInitial}>L</Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* App Title */}
      <Animated.View 
        style={[
          styles.titleContainer,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim }
            ]
          }
        ]}
      >
        <Text style={styles.title}>LalVault</Text>
        <Text style={styles.subtitle}>Fortify Your Digital Life</Text>
      </Animated.View>

      {/* Animated Security Elements */}
      <Animated.View 
        style={[
          styles.securityElements,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <View style={styles.securityShield}>
          <Text style={styles.shieldIcon}>🛡️</Text>
        </View>
        <View style={styles.securityLock}>
          <Text style={styles.lockIcon}>🔐</Text>
        </View>
        <View style={styles.securityKey}>
          <Text style={styles.keyIcon}>🔑</Text>
        </View>
      </Animated.View>

      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        {[...Array(25)].map((_, i) => (
          <Animated.View 
            key={i}
            style={[
              styles.patternElement,
              {
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.1, 0.4],
                }),
              }
            ]}
          />
        ))}
      </View>

      {/* Loading Indicator */}
      <Animated.View 
        style={[
          styles.loadingContainer,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <Text style={styles.loadingText}>Securing your vault...</Text>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill,
              {
                width: progressWidth, // This now works without native driver
              }
            ]}
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a237e', // Deep blue background
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#3949ab',
    shadowColor: '#7986cb',
    shadowOffset: { width: 0, height: 0 },
  },
  logo: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaultDoor: {
    width: 100,
    height: 120,
    alignItems: 'center',
  },
  doorFrame: {
    width: 80,
    height: 100,
    backgroundColor: '#3949ab',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#5c6bc0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  doorPanel: {
    width: 60,
    height: 80,
    backgroundColor: '#283593',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#5c6bc0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  doorHandle: {
    width: 8,
    height: 12,
    backgroundColor: '#ffd54f', // Gold handle
    borderRadius: 4,
    position: 'absolute',
    right: 8,
    top: '50%',
    marginTop: -6,
  },
  lockCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#5c6bc0',
    borderWidth: 2,
    borderColor: '#7986cb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  lockCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffd54f',
  },
  brandInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffd54f',
    marginTop: 4,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 3,
    marginBottom: 12,
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7986cb',
    letterSpacing: 2,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  securityElements: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginBottom: 40,
  },
  securityShield: {
    alignItems: 'center',
  },
  securityLock: {
    alignItems: 'center',
  },
  securityKey: {
    alignItems: 'center',
  },
  shieldIcon: {
    fontSize: 24,
    opacity: 0.8,
  },
  lockIcon: {
    fontSize: 28,
    opacity: 1,
  },
  keyIcon: {
    fontSize: 24,
    opacity: 0.8,
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  patternElement: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7986cb',
  },
  loadingContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 60,
  },
  loadingText: {
    fontSize: 14,
    color: '#7986cb',
    marginBottom: 12,
    letterSpacing: 1,
  },
  progressBar: {
    width: 200,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffd54f',
    borderRadius: 2,
  },
});

export default SplashScreen;