#pragma once

// TODO: This file should be .glsl

uniform float qrk_deltaTime;
// TODO: Replace these uniforms with a vec2.
uniform int qrk_windowWidth;
uniform int qrk_windowHeight;

bool qrk_is_window_left_half() { return gl_FragCoord.x < (qrk_windowWidth / 2); }
bool qrk_is_window_right_half() { return gl_FragCoord.x >= (qrk_windowWidth / 2); }

bool qrk_is_window_bottom_half() {
    return gl_FragCoord.y < (qrk_windowHeight / 2);
}

bool qrk_is_window_top_half() { return gl_FragCoord.y >= (qrk_windowHeight / 2); }
