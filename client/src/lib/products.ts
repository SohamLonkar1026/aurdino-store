export interface Product {
  id: string;
  name: string;
  price: number;
  icon: string;
  originalPrice?: number;
  description?: string;
  model?: string;
  specifications?: {
    microcontroller?: string;
    operatingVoltage?: string;
    clockSpeed?: string;
    digitalIO?: string;
    analogInputs?: string;
    flashMemory?: string;
    features?: string[];
  };
}

export const products: Product[] = [

  {id: 'arduino-uno', name: 'SMD Arduino UNO R3 Board', price: 450, icon: '🔌'},
  {id: 'ultrasonic-sensor', name: 'Ultrasonic Distance Sensor', price: 120, icon: '📡'},
  {id: 'servo-motor', name: 'Servo Motor', price: 200, icon: '⚙️'},
  {id: 'dc-motor', name: 'DC Motor', price: 150, icon: '🔄'},
  {id: 'relay', name: 'Relay', price: 80, icon: '🔘'},
  {id: 'lcd-display', name: 'LCD1602 Display', price: 180, icon: '📺'},
  {id: '7-segment', name: '7-Segment Display 4X module', price: 160, icon: '🔢'},
  {id: 'active-buzzer', name: 'Active Buzzer', price: 40, icon: '🔊'},
  {id: 'thermistor', name: '2x Analog Thermistor – Temp Sensor', price: 60, icon: '🌡️'},
  {id: 'light-sensor', name: '2x Light Sensor (Photo-resistor)', price: 50, icon: '💡'},
  {id: 'tilt-switch', name: 'Tilt Switch', price: 35, icon: '⚖️'},
  {id: 'button-switch', name: '2x Button Switch (Large)', price: 40, icon: '🔲'},
  {id: 'rgb-led', name: 'RGB LED', price: 25, icon: '🌈'},
  {id: 'red-led', name: '5x Red LED', price: 20, icon: '🔴'},
  {id: 'green-led', name: '5x Green LED', price: 20, icon: '🟢'},
  {id: 'yellow-led', name: '5x Yellow LED', price: 20, icon: '🟡'},
  {id: 'blue-led', name: '5x Blue LED', price: 20, icon: '🔵'},
  {id: 'resistor-220', name: '6x Resistor (220 Ω)', price: 15, icon: '📏'},
  {id: 'resistor-10k', name: '6x Resistor (10 kΩ)', price: 15, icon: '📏'},
  {id: 'i2c-module', name: 'I2C Module', price: 100, icon: '🔗'},
  {id: 'ir-sensor', name: 'IR Sensor Module / Bare Sensor', price: 90, icon: '👁️'},
  {id: 'transistor', name: '2x NPN Transistor (8050)', price: 30, icon: '🔬'},
  {id: 'potentiometer', name: 'Potentiometer (10kΩ)', price: 45, icon: '🎚️'},
  {id: 'diode-4148', name: '2x 1N4148 Diode', price: 15, icon: '➡️'},
  {id: 'diode-4001', name: '2x 1N4001 Diode', price: 18, icon: '➡️'},
  {id: 'usb-cable', name: 'USB Cable', price: 80, icon: '🔌'},
  {id: 'breadboard', name: 'Breadboard', price: 120, icon: '⚡'},
  {id: 'battery-holder', name: 'Battery Holder', price: 50, icon: '🔋'},
  {id: 'jumper-mm', name: '40x Male to Male Jumper Wires', price: 40, icon: '🔗'},
  {id: 'jumper-mf', name: '20x Male to Female Jumper Wires', price: 35, icon: '🔗'},
  {id: 'header-pins', name: 'Header (40 pin)', price: 25, icon: '📌'},
  {id: 'resistor-card', name: 'Band Resistor Card', price: 30, icon: '💳'},
  {id: 'motor-driver', name: 'L293D Motor Driver IC', price: 85, icon: '🔬'},
  {id: 'laser-diode', name: 'Laser Diode', price: 65, icon: '🔴'},
  {id: 'piezo-sensor', name: 'Piezoelectric Sensor', price: 55, icon: '🎵'},
  {id: 'resistor-2k2', name: 'Resistor 2.2k ohm', price: 8, icon: '📏'},
  {id: 'bluetooth-module', name: 'HC-05 Bluetooth Module', price: 350, icon: '📶'},
  {id: 'optocoupler', name: 'Opto-coupler', price: 40, icon: '👁️'},
  {id: 'inductor', name: 'Inductor', price: 20, icon: '🌀'},
  {id: 'capacitor-104', name: '2x Capacitor (104)', price: 12, icon: '⚡'},
  {id: 'capacitor-10uf', name: '2x Capacitor (10uF)', price: 15, icon: '⚡'},
  {id: 'project-box', name: 'Project Box', price: 75, icon: '📦'}
];
