// Automatic Parking System - QR Scanner Component
// Single-file React component with WebRTC camera and QR scanning

// Import React from CDN (will be loaded in HTML)
const { useState, useEffect, useRef, useCallback } = React;

// QR Code scanning using jsQR library
class QRScanner {
    constructor(video, canvas, onQRDetected, onError) {
        this.video = video;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.onQRDetected = onQRDetected;
        this.onError = onError;
        this.scanning = false;
        this.lastDetectedCode = null;
        this.lastDetectedTime = 0;
        this.debounceMs = 5000; // 5 seconds debounce
    }

    async startScanning() {
        if (this.scanning) return;
        
        try {
            // Request camera access with fallback resolutions
            const constraints = {
                video: {
                    facingMode: 'environment', // Use back camera if available
                    width: { ideal: 1280, min: 640 },
                    height: { ideal: 720, min: 480 }
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = stream;
            this.video.play();
            
            this.video.addEventListener('loadedmetadata', () => {
                // Set canvas size to match video
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;
                this.scanning = true;
                this.scanFrame();
            });

        } catch (error) {
            console.error('Camera access error:', error);
            this.onError('Camera access denied or not available. Please check permissions.');
        }
    }

    stopScanning() {
        this.scanning = false;
        if (this.video.srcObject) {
            const tracks = this.video.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            this.video.srcObject = null;
        }
    }

    scanFrame() {
        if (!this.scanning) return;

        if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
            // Draw video frame to canvas
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            
            // Get image data for QR scanning
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            
            // Scan for QR code using jsQR
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });

            if (qrCode) {
                const now = Date.now();
                
                // Debounce: ignore same code within debounce period
                if (qrCode.data !== this.lastDetectedCode || 
                    (now - this.lastDetectedTime) > this.debounceMs) {
                    
                    this.lastDetectedCode = qrCode.data;
                    this.lastDetectedTime = now;
                    
                    // Draw detection overlay
                    this.drawDetectionOverlay(qrCode.location);
                    
                    // Notify parent component
                    this.onQRDetected(qrCode.data);
                }
            }
        }

        // Continue scanning at ~10 fps
        setTimeout(() => this.scanFrame(), 100);
    }

    drawDetectionOverlay(location) {
        const { topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner } = location;
        
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(topLeftCorner.x, topLeftCorner.y);
        this.ctx.lineTo(topRightCorner.x, topRightCorner.y);
        this.ctx.lineTo(bottomRightCorner.x, bottomRightCorner.y);
        this.ctx.lineTo(bottomLeftCorner.x, bottomLeftCorner.y);
        this.ctx.lineTo(topLeftCorner.x, topLeftCorner.y);
        this.ctx.stroke();
        
        // Add success indicator
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('QR Detected!', topLeftCorner.x, topLeftCorner.y - 10);
    }

    rescan() {
        // Force rescan by clearing debounce
        this.lastDetectedCode = null;
        this.lastDetectedTime = 0;
    }
}

// Toast notification component
function Toast({ message, type, onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? 'bg-green-500' : 
                   type === 'error' ? 'bg-red-500' : 'bg-blue-500';

    return React.createElement('div', {
        className: `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md`,
        style: { animation: 'slideIn 0.3s ease-out' }
    }, [
        React.createElement('div', { className: 'flex justify-between items-center' }, [
            React.createElement('span', { key: 'message' }, message),
            React.createElement('button', {
                key: 'close',
                onClick: onClose,
                className: 'ml-4 text-white hover:text-gray-200',
                children: '×'
            })
        ])
    ]);
}

// Main Scanner Component
function ParkingScanner() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const scannerRef = useRef(null);
    
    const [isScanning, setIsScanning] = useState(false);
    const [lastScans, setLastScans] = useState([]);
    const [toast, setToast] = useState(null);
    const [manualVehicleId, setManualVehicleId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Initialize scanner
    useEffect(() => {
        if (videoRef.current && canvasRef.current) {
            scannerRef.current = new QRScanner(
                videoRef.current,
                canvasRef.current,
                handleQRDetected,
                handleScanError
            );
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.stopScanning();
            }
        };
    }, []);

    const handleQRDetected = useCallback(async (qrData) => {
        console.log('QR detected:', qrData);
        setIsLoading(true);
        
        try {
            const response = await fetch('/api/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ qr: qrData })
            });

            const result = await response.json();

            if (response.ok) {
                // Success
                const scanRecord = {
                    id: Date.now(),
                    timestamp: new Date().toLocaleString(),
                    vehicle_id: result.vehicle_id,
                    plate: result.vehicle.plate,
                    action: result.action,
                    message: result.message,
                    success: true
                };

                setLastScans(prev => [scanRecord, ...prev.slice(0, 4)]);
                setToast({ message: result.message, type: 'success' });
            } else {
                // Error
                const scanRecord = {
                    id: Date.now(),
                    timestamp: new Date().toLocaleString(),
                    vehicle_id: qrData,
                    action: 'error',
                    message: result.message || result.error,
                    success: false
                };

                setLastScans(prev => [scanRecord, ...prev.slice(0, 4)]);
                setToast({ message: result.message || result.error, type: 'error' });
            }
        } catch (error) {
            console.error('Scan API error:', error);
            const scanRecord = {
                id: Date.now(),
                timestamp: new Date().toLocaleString(),
                vehicle_id: qrData,
                action: 'error',
                message: 'Network error - please try again',
                success: false
            };

            setLastScans(prev => [scanRecord, ...prev.slice(0, 4)]);
            setToast({ message: 'Network error - please try again', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleScanError = useCallback((error) => {
        setToast({ message: error, type: 'error' });
    }, []);

    const startScanning = async () => {
        if (scannerRef.current) {
            await scannerRef.current.startScanning();
            setIsScanning(true);
        }
    };

    const stopScanning = () => {
        if (scannerRef.current) {
            scannerRef.current.stopScanning();
            setIsScanning(false);
        }
    };

    const rescan = () => {
        if (scannerRef.current) {
            scannerRef.current.rescan();
            setToast({ message: 'Ready to scan new QR code', type: 'info' });
        }
    };

    const handleManualLookup = async () => {
        if (!manualVehicleId.trim()) {
            setToast({ message: 'Please enter a vehicle ID', type: 'error' });
            return;
        }

        await handleQRDetected(manualVehicleId.trim());
        setManualVehicleId('');
    };

    const closeToast = () => setToast(null);

    return React.createElement('div', {
        className: 'min-h-screen bg-gray-100 p-4'
    }, [
        // Header
        React.createElement('div', {
            key: 'header',
            className: 'max-w-4xl mx-auto mb-6'
        }, [
            React.createElement('h1', {
                key: 'title',
                className: 'text-3xl font-bold text-center text-gray-800 mb-2'
            }, 'Automatic Parking System'),
            React.createElement('p', {
                key: 'subtitle',
                className: 'text-center text-gray-600'
            }, 'Scan QR codes on vehicles to log entry and exit times')
        ]),

        // Main content
        React.createElement('div', {
            key: 'main',
            className: 'max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6'
        }, [
            // Camera section
            React.createElement('div', {
                key: 'camera',
                className: 'bg-white rounded-lg shadow-lg p-6'
            }, [
                React.createElement('h2', {
                    key: 'camera-title',
                    className: 'text-xl font-semibold mb-4'
                }, 'QR Code Scanner'),
                
                React.createElement('div', {
                    key: 'camera-container',
                    className: 'relative mb-4'
                }, [
                    React.createElement('video', {
                        key: 'video',
                        ref: videoRef,
                        className: 'w-full h-64 bg-black rounded-lg object-cover',
                        style: { display: isScanning ? 'block' : 'none' }
                    }),
                    React.createElement('canvas', {
                        key: 'canvas',
                        ref: canvasRef,
                        className: 'absolute top-0 left-0 w-full h-64 rounded-lg',
                        style: { display: isScanning ? 'block' : 'none' }
                    }),
                    !isScanning && React.createElement('div', {
                        key: 'placeholder',
                        className: 'w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center'
                    }, [
                        React.createElement('div', {
                            key: 'placeholder-content',
                            className: 'text-center text-gray-500'
                        }, [
                            React.createElement('div', {
                                key: 'icon',
                                className: 'text-6xl mb-2'
                            }, '📷'),
                            React.createElement('p', { key: 'text' }, 'Camera not active')
                        ])
                    ]),
                    isLoading && React.createElement('div', {
                        key: 'loading',
                        className: 'absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg'
                    }, [
                        React.createElement('div', {
                            key: 'spinner',
                            className: 'text-white text-lg'
                        }, 'Processing...')
                    ])
                ]),

                // Camera controls
                React.createElement('div', {
                    key: 'controls',
                    className: 'flex gap-2 mb-4'
                }, [
                    React.createElement('button', {
                        key: 'start',
                        onClick: startScanning,
                        disabled: isScanning,
                        className: `px-4 py-2 rounded-lg font-medium ${
                            isScanning 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-green-500 text-white hover:bg-green-600'
                        }`
                    }, 'Start Camera'),
                    React.createElement('button', {
                        key: 'stop',
                        onClick: stopScanning,
                        disabled: !isScanning,
                        className: `px-4 py-2 rounded-lg font-medium ${
                            !isScanning 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-red-500 text-white hover:bg-red-600'
                        }`
                    }, 'Stop Camera'),
                    React.createElement('button', {
                        key: 'rescan',
                        onClick: rescan,
                        disabled: !isScanning,
                        className: `px-4 py-2 rounded-lg font-medium ${
                            !isScanning 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`
                    }, 'Rescan')
                ]),

                // Manual lookup
                React.createElement('div', {
                    key: 'manual',
                    className: 'border-t pt-4'
                }, [
                    React.createElement('h3', {
                        key: 'manual-title',
                        className: 'font-medium mb-2'
                    }, 'Manual Vehicle Lookup'),
                    React.createElement('div', {
                        key: 'manual-form',
                        className: 'flex gap-2'
                    }, [
                        React.createElement('input', {
                            key: 'input',
                            type: 'text',
                            value: manualVehicleId,
                            onChange: (e) => setManualVehicleId(e.target.value),
                            placeholder: 'Enter vehicle ID',
                            className: 'flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                            onKeyPress: (e) => e.key === 'Enter' && handleManualLookup()
                        }),
                        React.createElement('button', {
                            key: 'lookup',
                            onClick: handleManualLookup,
                            disabled: isLoading,
                            className: 'px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300'
                        }, 'Lookup')
                    ])
                ])
            ]),

            // Scan history section
            React.createElement('div', {
                key: 'history',
                className: 'bg-white rounded-lg shadow-lg p-6'
            }, [
                React.createElement('h2', {
                    key: 'history-title',
                    className: 'text-xl font-semibold mb-4'
                }, 'Recent Scans'),
                
                lastScans.length === 0 ? React.createElement('p', {
                    key: 'no-scans',
                    className: 'text-gray-500 text-center py-8'
                }, 'No scans yet') : React.createElement('div', {
                    key: 'scan-list',
                    className: 'space-y-3'
                }, lastScans.map(scan => 
                    React.createElement('div', {
                        key: scan.id,
                        className: `p-3 rounded-lg border-l-4 ${
                            scan.success 
                                ? 'border-green-500 bg-green-50' 
                                : 'border-red-500 bg-red-50'
                        }`
                    }, [
                        React.createElement('div', {
                            key: 'scan-header',
                            className: 'flex justify-between items-start mb-1'
                        }, [
                            React.createElement('span', {
                                key: 'plate',
                                className: 'font-medium'
                            }, scan.plate || scan.vehicle_id),
                            React.createElement('span', {
                                key: 'action',
                                className: `px-2 py-1 rounded text-xs font-medium ${
                                    scan.action === 'entry' ? 'bg-blue-100 text-blue-800' :
                                    scan.action === 'exit' ? 'bg-purple-100 text-purple-800' :
                                    'bg-red-100 text-red-800'
                                }`
                            }, scan.action.toUpperCase())
                        ]),
                        React.createElement('p', {
                            key: 'message',
                            className: 'text-sm text-gray-600 mb-1'
                        }, scan.message),
                        React.createElement('p', {
                            key: 'timestamp',
                            className: 'text-xs text-gray-400'
                        }, scan.timestamp)
                    ])
                ))
            ])
        ]),

        // Toast notifications
        toast && React.createElement(Toast, {
            key: 'toast',
            message: toast.message,
            type: toast.type,
            onClose: closeToast
        })
    ]);
}

// Render the app
ReactDOM.render(
    React.createElement(ParkingScanner),
    document.getElementById('root')
);