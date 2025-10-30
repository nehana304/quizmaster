import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private audioContext: AudioContext | null = null;
  private sounds: { [key: string]: AudioBuffer } = {};
  private isMuted = false;

  constructor() {
    this.initializeAudioContext();
    this.loadSounds();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  private async loadSounds() {
    const soundFiles = {
      correct: this.generateCorrectSound(),
      incorrect: this.generateIncorrectSound(),
      tick: this.generateTickSound(),
      complete: this.generateCompleteSound(),
      warning: this.generateWarningSound()
    };

    for (const [name, audioBuffer] of Object.entries(soundFiles)) {
      this.sounds[name] = audioBuffer;
    }
  }

  // Generate correct answer sound (pleasant chime)
  private generateCorrectSound(): AudioBuffer {
    if (!this.audioContext) return null as any;
    
    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.5, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      const t = i / this.audioContext.sampleRate;
      // Pleasant major chord progression
      data[i] = (
        Math.sin(2 * Math.PI * 523.25 * t) * 0.3 + // C5
        Math.sin(2 * Math.PI * 659.25 * t) * 0.2 + // E5
        Math.sin(2 * Math.PI * 783.99 * t) * 0.1   // G5
      ) * Math.exp(-t * 3); // Fade out
    }
    
    return buffer;
  }

  // Generate incorrect answer sound (gentle buzz)
  private generateIncorrectSound(): AudioBuffer {
    if (!this.audioContext) return null as any;
    
    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.3, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      const t = i / this.audioContext.sampleRate;
      // Gentle descending tone
      data[i] = Math.sin(2 * Math.PI * (200 - t * 50) * t) * 0.3 * Math.exp(-t * 5);
    }
    
    return buffer;
  }

  // Generate timer tick sound
  private generateTickSound(): AudioBuffer {
    if (!this.audioContext) return null as any;
    
    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.1, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      const t = i / this.audioContext.sampleRate;
      data[i] = Math.sin(2 * Math.PI * 800 * t) * 0.2 * Math.exp(-t * 20);
    }
    
    return buffer;
  }

  // Generate quiz complete sound (celebration)
  private generateCompleteSound(): AudioBuffer {
    if (!this.audioContext) return null as any;
    
    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 1, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      const t = i / this.audioContext.sampleRate;
      // Ascending celebration melody
      const freq = 440 + Math.sin(t * 8) * 200;
      data[i] = Math.sin(2 * Math.PI * freq * t) * 0.3 * Math.exp(-t * 2);
    }
    
    return buffer;
  }

  // Generate warning sound (time running out)
  private generateWarningSound(): AudioBuffer {
    if (!this.audioContext) return null as any;
    
    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.2, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      const t = i / this.audioContext.sampleRate;
      // Urgent beeping
      data[i] = Math.sin(2 * Math.PI * 1000 * t) * 0.4 * (Math.sin(t * 20) > 0 ? 1 : 0);
    }
    
    return buffer;
  }

  playSound(soundName: string, volume: number = 1) {
    if (this.isMuted || !this.audioContext || !this.sounds[soundName]) {
      return;
    }

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = this.sounds[soundName];
      gainNode.gain.value = volume * 0.5; // Keep sounds at reasonable volume
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start();
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }

  // Convenience methods
  playCorrect() {
    this.playSound('correct');
  }

  playIncorrect() {
    this.playSound('incorrect');
  }

  playTick() {
    this.playSound('tick', 0.3);
  }

  playComplete() {
    this.playSound('complete');
  }

  playWarning() {
    this.playSound('warning');
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  isSoundMuted(): boolean {
    return this.isMuted;
  }
}