package com.dailysaju.premium;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onResume() {
        super.onResume();
        
        // Android Device System Font Scale Override
        // This completely prevents the WebView from being zoomed to 1.5x due to system accessibility settings.
        WebView webView = this.bridge.getWebView();
        if (webView != null) {
            WebSettings settings = webView.getSettings();
            settings.setTextZoom(100);
        }
    }
}
