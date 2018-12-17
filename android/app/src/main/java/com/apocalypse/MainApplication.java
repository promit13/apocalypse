package com.apocalypse;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.eko.RNBackgroundDownloaderPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.tanguyantoine.react.MusicControl;
import com.github.yamill.orientation.OrientationPackage;
import io.realm.react.RealmReactPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.dooboolab.RNIap.RNIapPackage;
import com.reactnative.googlefit.GoogleFitPackage;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.rnfs.RNFSPackage;
import com.brentvatne.react.ReactVideoPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import com.facebook.FacebookSdk;
import com.facebook.CallbackManager;
import com.facebook.appevents.AppEventsLogger;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private static CallbackManager mCallbackManager = CallbackManager.Factory.create();

  protected static CallbackManager getCallbackManager() {
    return mCallbackManager;
  }


  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNBackgroundDownloaderPackage(),
            new RNDeviceInfo(),
            new MusicControl(),
            new OrientationPackage(),
            new RealmReactPackage(),
            new RNFetchBlobPackage(),
            new RNIapPackage(),
            new GoogleFitPackage(BuildConfig.APPLICATION_ID),
            new FBSDKPackage(mCallbackManager),
            new VectorIconsPackage(),
            new RNFSPackage(),
            new ReactVideoPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    AppEventsLogger.activateApp(this);
    SoLoader.init(this, /* native exopackage */ false);
  }
}
