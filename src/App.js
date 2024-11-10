import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import './App.css';
import AWS from 'aws-sdk';
import SageMakerRuntime from 'aws-sdk/clients/sagemakerruntime';

const env = {
  "ACCESS_KEY": "***",
  "SECRET_KEY": "***",
  "REGION": "us-east-2"
};
// Load environment variables
const ACCESS_KEY = env.ACCESS_KEY;
const SECRET_KEY = env.SECRET_KEY;
const REGION = env.REGION;

if (!ACCESS_KEY || !SECRET_KEY || !REGION) {
  console.log('env', env)
  throw new Error('AWS credentials or region are missing from environment variables');
}

// Configure AWS SDK
const awsConfig = new AWS.Config({
  credentials: new AWS.Credentials({
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY
  }),
  region: REGION
});

// Apply the configuration globally
AWS.config.update(awsConfig);

// Create S3 service object
const s3 = new AWS.S3();

// Create SageMaker Runtime client
const sagemakerruntime = new SageMakerRuntime({
  apiVersion: '2017-05-13',
  ...awsConfig
});

const projects = {
  'prostate': {
    name: 'prostate',
    displayName: 'Prostate Cancer',
    endpoint: 'prostate-0b',
    images: [
      //'/images/000920ad0b612851f8e01bcc880d9b3d.tiff',
      //'/images/0018ae58b01bdadc8e347995b69f99aa.tiff',
      //'/images/001d865e65ef5d2579c190a0e0350d8f.tiff',
      //'/images/002a4db09dad406c85505a00fb6f6144.tiff',
      //'/images/0032bfa835ce0f43a92ae0bbab6871cb.tiff',
      //'/images/003a91841da04a5a31f808fb5c21538a.tiff',
      //'/images/003d4dd6bd61221ebc0bfb9350db333f.tiff',
      '/images/007433133235efc27a39f11df6940829.tiff',
      '/images/008069b542b0439ed69b194674051964.tiff',
      '/images/0076bcb66e46fb485f5ba432b9a1fe8a.tiff'
    ],
    masks: [
      //'/images/000920ad0b612851f8e01bcc880d9b3d_mask.tiff',
      //'/images/0018ae58b01bdadc8e347995b69f99aa_mask.tiff',
      //'/images/001d865e65ef5d2579c190a0e0350d8f_mask.tiff',
      //'/images/002a4db09dad406c85505a00fb6f6144_mask.tiff',
      //'/images/0032bfa835ce0f43a92ae0bbab6871cb_mask.tiff',
      //'/images/003a91841da04a5a31f808fb5c21538a_mask.tiff',
      //'/images/003d4dd6bd61221ebc0bfb9350db333f_mask.tiff',
      '/images/007433133235efc27a39f11df6940829_mask.tiff',
      '/images/008069b542b0439ed69b194674051964_mask.tiff',
      '/images/0076bcb66e46fb485f5ba432b9a1fe8a_mask.tiff'
    ],
    maskColors: {
      '2': [251, 255, 28, 80],
      '3': [255,160,25,80],
      '4': [255,0,0,80]
    },
    imageWidth: 1600,
    imageHeight: 1200,
    imageSize: 50,
    redMultiple: 4,
    greenMultiple: 2,
    blueMultiple: 1/2,
    brighten: false,
    labels: [
      {
        name: 'Healthy',
        abbreviation: '0',
        classNum: '0',
        color: '#0f0'
      },
      {
        name: 'Gleason 3',
        abbreviation: '3',
        classNum: '1',
        color: '#fa9b3c'
      },
      {
        name: 'Gleason 4',
        abbreviation: '4',
        classNum: '2',
        color: '#fcff2e'
      },
      {
        name: 'Gleason 5',
        abbreviation: '5',
        classNum: '3',
        color: '#f77'
      },
    ]
  },
  'lung': {
    name: 'lung',
    displayName: 'Lung Classification',
    endpoint: 'lung-1c',
    images: [
      '/images/ISH_062118_AGER_R6052_1Days_D109-LUL-5A1_5.4_s1.png',
      '/images/ISH061918_EPAS1_R6071_1Days_D102-LUL-7A1_1.4_s1.png',
      '/images/ISH061918_EPAS1_R6071_1Days_D102-LUL-7A1_1.4_s2.png',
      '/images/ISH061918_EPAS1_R6071_1Days_D102-LUL-9A2_1.4_s1.png',
      '/images/ISH061918_EPAS1_R6071_1Days_D102-LUL-9A2_1.4_s2.png',
      '/images/ISH061918_EPAS1_R6071_1Days_D109-LUL-5A1_1.4_s1.png',
      '/images/ISH061918_EPAS1_R6071_1Days_D109-LUL-5A1_1.4_s2.png',
      '/images/ISH061918_EPAS1_R6071_1Days_D109-LUL-9A1_1.4_s1.png',
      '/images/ISH061918_EPAS1_R6071_1Days_D109-LUL-9A1_1.4_s2.png',
      '/images/ISH061918_EPAS1_R6071_7Days_D142-LUL-9B3_1.4_s1.png',
      '/images/ISH061918_EPAS1_R6071_7Days_D142-LUL-9B3_1.4_s2.png',
      '/images/ISH061918_EPAS1_R6071_7Days_D142-LUL-11A1_1.4_s1.png',
      '/images/ISH061918_EPAS1_R6071_7Days_D142-LUL-11A1_1.4_s2.png',
      '/images/ISH112718_CCR1_R6059_2_3Years_D149-LUL-9B1_2.5_s1.png',
      '/images/ISH112718_CCR1_R6059_2_8Years_D036-LUL-11B5_2.5_s2.png',
      '/images/ISH120318_EFNB1_R6069_2_1Days_D038-LUL-5A1_7.5_s1.png',
      '/images/ISH120318_EFNB1_R6069_2_1Days_D038-LUL-5A1_7.5_s2.png',
      '/images/ISH120318_EFNB1_R6069_2_1Days_D038-LUL-7A3_7.5_s1.png',
      '/images/ISH120318_EFNB1_R6069_2_1Days_D038-LUL-7A3_7.5_s2.png',
      '/images/ISH120318_EFNB1_R6069_2_2Months_D092-LUL-9B1_7.5_s1.png',
      '/images/ISH120318_EFNB1_R6069_2_3Years_D046-LUL-13A3_7.5_s1.png',
      '/images/ISH120318_EFNB1_R6069_2_8Years_D036-LUL-11B5_7.5_s2.png'
    ],
    imageWidth: 2400,
    imageHeight: 1800,
    imageSize: 50,
    redMultiple: 24,
    greenMultiple: 8,
    blueMultiple: 1,
    brighten: true,
    labels: [
      {
        name: 'Alveoli',
        abbreviation: 'A',
        classNum: '0',
        color: '#0f0'
      },
      {
        name: 'Duct',
        abbreviation: 'D',
        classNum: '1',
        color: '#bbf'
      },
      {
        name: 'Septa',
        abbreviation: 'S',
        classNum: '2',
        color: '#fbb'
      }
    ]
  }
}

function App() {
  
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const windowWidth = dimensions.width;
  const windowHeight = dimensions.height;

  const [activeProject, setActiveProject] = useState('prostate');
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const [clickData, setClickData] = useState([]);
  const [activeClass, setActiveClass] = useState('S');
  const [maskOn, setMaskOn] = useState(true);
  const [labels, setLabels] = useState([]);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const redCanvasRef = useRef(null);
  const greenCanvasRef = useRef(null);
  const blueCanvasRef = useRef(null);
  const smallCanvasRef = useRef(null);
  const imageRef = useRef(null);

  const labelColors = useMemo(() => {
    let result = {};
    projects[activeProject].labels.forEach(label => {
      result[label.abbreviation] = label.color;
    });
    return result;
  }, [activeProject]);

  const classToNumber = useMemo(() => {
    let result = {};
    projects[activeProject].labels.forEach(label => {
      result[label.abbreviation] = label.classNum;
    });
    return result;
  }, [activeProject]);

  const labelNames = useMemo(() => {
    let result = {};
    projects[activeProject].labels.forEach(label => {
      result[label.abbreviation] = label.name;
    });
    return result;
  }, [activeProject]);

  const activeLabels = useMemo(() => {
    return projects[activeProject].labels;
  }, [activeProject]);

  const textClickData = useMemo(() => {
    return clickData.map(click => ({
        class: labelNames[click.class],
        x: click.x,
        y: click.y
      })
    )
  }, [clickData]);

  const imageWidth = useMemo(() => {
    return projects[activeProject].imageWidth;
  }, [activeProject]);

  const imageHeight = useMemo(() => {
    return projects[activeProject].imageHeight;
  }, [activeProject]);

  const imageSize = useMemo(() => {
    return projects[activeProject].imageSize;
  }, [activeProject]);

  const redMultiple = useMemo(() => {
    return projects[activeProject].redMultiple;
  }, [activeProject]);

  const greenMultiple = useMemo(() => {
    return projects[activeProject].greenMultiple;
  }, [activeProject]);

  const blueMultiple = useMemo(() => {
    return projects[activeProject].blueMultiple;
  }, [activeProject]);

  const brighten = useMemo(() => {
    return projects[activeProject].brighten;
  }, [activeProject]);

  const maxWidth = Math.min(imageWidth, windowWidth - 500);
  const maxHeight = Math.min(imageHeight, windowHeight); 

  const leftOffset = (maxWidth - imageWidth) / 2;
  const topOffset = (maxHeight - imageHeight) / 2;

  useEffect(() => {
    setActiveClass(projects[activeProject].labels[0].abbreviation);
  }, [activeProject, setActiveClass]);

  const imagePadding = imageSize * Math.max(redMultiple, greenMultiple, blueMultiple) / 2;
  
  const grabRandomCrop = useCallback(() => {
    const imageIndex = Math.floor(Math.random() * projects[activeProject].images.length);
    const imageUrl = `https://newbai-ai-resources.s3.us-east-2.amazonaws.com` + projects[activeProject].images[imageIndex];
    const mask = projects[activeProject].masks ? projects[activeProject].masks[imageIndex] : undefined;
    console.log('processImage', imageUrl);
    //if (imageUrl.indexOf('.tif') > -1) {
    //  const dataUrl = await tiffSliceToPng(imageUrl, 0, 0, imageWidth, imageHeight);
    //  console.log('tiff dataUrl', dataUrl);
    //}

    const processImage = async () => {
      if (imageUrl.indexOf('.tiff') > -1) {

        window.Tiff.initialize({TOTAL_MEMORY: 16777216 * 25});

        const maskCanvas = await new Promise((resolve, reject) => {
          if (!mask) {
            resolve(null);
          } else {

            var xhr = new XMLHttpRequest();
            xhr.responseType = 'arraybuffer';
            xhr.open('GET', `${mask}`);
            xhr.onload = function (e) {
              var tiff = new window.Tiff({buffer: xhr.response});
              console.log('tiff', tiff);
              console.log('tiff.width()', tiff.width(), 'tiff.height()', tiff.height());
              var tempCanvas = tiff.toCanvas();
              resolve(tempCanvas);
              
            };
            xhr.send();
          }
        });
        
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'arraybuffer';
        xhr.open('GET', `${imageUrl}`);
        xhr.onload = function (e) {
          var tiff = new window.Tiff({buffer: xhr.response});
          console.log('tiff', tiff);
          console.log('tiff.width()', tiff.width(), 'tiff.height()', tiff.height());
          var tempCanvas = tiff.toCanvas();
          const tempCtx = tempCanvas.getContext('2d');
          //window.document.body.appendChild(tempCanvas);
          
          let randomPointCount = 0;
          let foundPixel = false;
          let startX;
          let startY;

          while (!foundPixel && randomPointCount < 1000) {
            randomPointCount += 1;
            startX = Math.floor(Math.random() * (tiff.width() - imageWidth));
            startY = Math.floor(Math.random() * (tiff.height() - imageHeight));

            let pImageData = tempCtx.getImageData(Math.floor(startX + imageWidth/2), Math.floor(startY + imageHeight/2), 5, 5);
            let pData = pImageData.data;
            console.log('pData', pData);

            for (let i = 0; i < pData.length; i += 4) {
              if (pData[i] < 220 && pData[i + 1] < 220 && pData[i + 2] < 220 && pData[i + 3] > 0) {
                foundPixel = true;
              }
            }

          }
      
          console.log('randomPointCount', randomPointCount);
          console.log('startX', startX, 'startY', startY);

          const canvas = canvasRef.current;
          canvas.width = imageWidth;
          canvas.height = imageHeight;
          const ctx = canvas.getContext('2d');

          ctx.drawImage(
            tempCanvas, 
            startX, startY, imageWidth, imageHeight, 
            0, 0, imageWidth, imageHeight 
          );
          if (mask) {
            const maskColors = projects[activeProject].maskColors;
            const maskCtx = maskCanvas.getContext('2d');
            const maskCanvasCtx = maskCanvasRef.current.getContext('2d');
            maskCanvasRef.current.width = imageWidth;
            maskCanvasRef.current.height = imageHeight;
            let maskImageData = maskCtx.getImageData(Math.floor(startX), Math.floor(startY), imageWidth, imageHeight);
            let maskData = maskImageData.data;

            let cachedMaskData = [...maskImageData.data];

            for (let i = 0; i < maskData.length; i += 4) {
              let upI = (i / 4 - imageWidth) * 4
              let downI = (i / 4 + imageWidth) * 4
              let leftI = i - 4;
              let rightI = i + 4;
              if (upI < 0) {
                upI = i;
              }
              if (leftI < 0) {
                leftI = i;
              }
              if (downI >= maskData.length) {
                downI = i;
              }
              if (rightI >= maskData.length) {
                rightI = i;
              }
              const upVal = cachedMaskData[upI];
              const downVal = cachedMaskData[downI];
              const leftVal = cachedMaskData[leftI];
              const rightVal = cachedMaskData[rightI];

              const val = cachedMaskData[i];

              
              if (val !== upVal || val !== downVal || val !== leftVal || val !== rightVal) {
                //console.log("FOUND DIFFERENT VALS", val, upVal, downVal, leftVal, rightVal);
                const maxVal = Math.max(val, upVal, downVal, leftVal, rightVal);
                if (maskColors[maxVal]) {
                  maskData[i] = maskColors[maxVal][0];
                  maskData[i + 1] = maskColors[maxVal][1];
                  maskData[i + 2] = maskColors[maxVal][2];
                  maskData[i + 3] = 255;
                } else {
                  maskData[i] = 0;
                  maskData[i + 1] = 0;
                  maskData[i + 2] = 0;
                  maskData[i + 3] = 0;
                }
              } else {
                if (maskColors[val]) {
                  maskData[i] = maskColors[val][0];
                  maskData[i + 1] = maskColors[val][1];
                  maskData[i + 2] = maskColors[val][2];
                  maskData[i + 3] = maskColors[val][3];
                } else {
                  maskData[i] = 0;
                  maskData[i + 1] = 0;
                  maskData[i + 2] = 0;
                  maskData[i + 3] = 0;
                }
              }
              //if (maskData[i + 3] > 0) {
              //} else {
              //  maskData[i] = 0;
              //  maskData[i + 1] = 0;
              //  maskData[i + 2] = 0;
              //  maskData[i + 3] = 0;
              //}
            }
            maskCanvasCtx.putImageData(maskImageData, 0, 0);
            /*ctx.drawImage(
              tempCanvas, 
              startX, startY, imageWidth, imageHeight, 
              0, 0, imageWidth, imageHeight 
            );*/
          }
          
          const dataUrl = canvas.toDataURL('image/png');
          console.log('dataUrl', dataUrl);
          setCroppedImageUrl(dataUrl);
          
        };
        xhr.send();

      } else {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (!canvasRef.current) {
            return;
          }
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');

          var tempCanvas = document.createElement("canvas")
          tempCanvas.width = img.width;
          tempCanvas.height = img.height;
          const tempCtx = tempCanvas.getContext('2d');
          tempCtx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
          
          let randomPointCount = 0;
          let foundPixel = false;
          let startX;
          let startY;

          while (!foundPixel && randomPointCount < 1000) {
            randomPointCount += 1;
            startX = Math.floor(Math.random() * (img.width - imageWidth));
            startY = Math.floor(Math.random() * (img.height - imageHeight));

            let pImageData = tempCtx.getImageData(Math.floor(startX + imageWidth/2), Math.floor(startY + imageHeight/2), 5, 5);
            let pData = pImageData.data;
            console.log('pData', pData);

            for (let i = 0; i < pData.length; i += 4) {
              if (pData[i] < 220 && pData[i + 1] < 220 && pData[i + 2] < 220 && pData[i + 3] > 0) {
                foundPixel = true;
              }
            }

          }

          console.log('randomPointCount', randomPointCount);
          console.log('startX', startX, 'startY', startY);


          setCropOffset({ x: startX, y: startY });

          // Set canvas size and draw cropped image
          canvas.width = imageWidth;
          canvas.height = imageHeight;
          ctx.drawImage(img, startX, startY, imageWidth, imageHeight, 0, 0, imageWidth, imageHeight);

          // Convert canvas to data URL and set state
          const dataUrl = canvas.toDataURL('image/png');
          console.log('dataUrl', dataUrl);
          setCroppedImageUrl(dataUrl);
        };
        img.src = imageUrl;

      };
    }
    processImage();
  }, [activeProject, imageHeight, imageWidth]);

  /*useEffect(() => {
    setLabels([])
    setCroppedImageUrl(null);
    grabRandomCrop();
  }, [activeProject, grabRandomCrop])*/


  const getCroppedImage = useCallback((x, y) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const redCanvas = redCanvasRef.current;
    const redCtx = redCanvas.getContext('2d');
    redCanvas.width = imageSize;
    redCanvas.height = imageSize;

    const greenCanvas = greenCanvasRef.current;
    const greenCtx = greenCanvas.getContext('2d');
    greenCanvas.width = imageSize;
    greenCanvas.height = imageSize;

    const blueCanvas = blueCanvasRef.current;
    const blueCtx = blueCanvas.getContext('2d');
    blueCanvas.width = imageSize;
    blueCanvas.height = imageSize;

    const smallCanvas = smallCanvasRef.current;
    const smallCtx = smallCanvas.getContext('2d');
    smallCanvas.width = imageSize;
    smallCanvas.height = imageSize;

    smallCtx.clearRect(0, 0, smallCanvas.width, smallCanvas.height);
    //smallCtx.drawImage(canvas, x - 50, y - 50, 100, 100, 0, 0, 100, 100);


    // Create temporary canvases for scaling
    const tempRedCanvas = document.createElement('canvas');
    const tempRedCtx = tempRedCanvas.getContext('2d');
    tempRedCanvas.width = imageSize * redMultiple;
    tempRedCanvas.height = imageSize * redMultiple;

    const tempGreenCanvas = document.createElement('canvas');
    const tempGreenCtx = tempGreenCanvas.getContext('2d');
    tempGreenCanvas.width = imageSize * greenMultiple;
    tempGreenCanvas.height = imageSize * greenMultiple;

    const tempBlueCanvas = document.createElement('canvas');
    const tempBlueCtx = tempBlueCanvas.getContext('2d');
    tempBlueCanvas.width = imageSize * blueMultiple;
    tempBlueCanvas.height = imageSize * blueMultiple;

    // Get the image data at different scales
    const redRawImageData = ctx.getImageData(
      x - (imageSize * redMultiple) / 2,
      y - (imageSize * redMultiple) / 2,
      imageSize * redMultiple,
      imageSize * redMultiple
    );
    tempRedCtx.putImageData(redRawImageData, 0, 0);

    const greenRawImageData = ctx.getImageData(
      x - (imageSize * greenMultiple) / 2,
      y - (imageSize * greenMultiple) / 2,
      imageSize * greenMultiple,
      imageSize * greenMultiple
    );
    tempGreenCtx.putImageData(greenRawImageData, 0, 0);

    const blueRawImageData = ctx.getImageData(
      x - (imageSize * blueMultiple) / 2,
      y - (imageSize * blueMultiple) / 2,
      imageSize * blueMultiple,
      imageSize * blueMultiple
    );
    tempBlueCtx.putImageData(blueRawImageData, 0, 0);

    // Now scale the images using drawImage
    redCtx.drawImage(tempRedCanvas, 0, 0, imageSize * redMultiple, imageSize * redMultiple, 0, 0, imageSize, imageSize);
    greenCtx.drawImage(tempGreenCanvas, 0, 0, imageSize * greenMultiple, imageSize * greenMultiple, 0, 0, imageSize, imageSize);
    blueCtx.drawImage(tempBlueCanvas, 0, 0, imageSize * blueMultiple, imageSize * blueMultiple, 0, 0, imageSize, imageSize);


    const pImageData = ctx.getImageData(x - imageSize/2, y - imageSize/2, imageSize, imageSize);
    const pData = pImageData.data;


    const redImageData = ctx.getImageData(x - (imageSize * redMultiple) / 2, y - (imageSize * redMultiple) / 2, (imageSize * redMultiple), (imageSize * redMultiple));
    const redData = redImageData.data;

    const greenImageData = ctx.getImageData(x - (imageSize * greenMultiple) / 2, y - (imageSize * greenMultiple) / 2, (imageSize * greenMultiple), (imageSize * greenMultiple));
    const greenData = greenImageData.data;

    const blueImageData = ctx.getImageData(x - (imageSize * blueMultiple) / 2, y - (imageSize * blueMultiple) / 2, (imageSize * blueMultiple), (imageSize * blueMultiple));
    const blueData = blueImageData.data;

    console.log('blueData.length', blueData.length);

    // Convert to greyscale
    for (let p = 0; p < pData.length / 4; p += 1) {
      const pX = p % imageSize;
      const pY = Math.floor(p / imageSize);
      const redX = pX * redMultiple;
      const redY = pY * redMultiple;
      const greenX = Math.floor(pX * greenMultiple);
      const greenY = Math.floor(pY * greenMultiple);
      const blueX = Math.floor(pX * blueMultiple);
      const blueY = Math.floor(pY * blueMultiple);

      const redI = (redY * imageSize * redMultiple + redX) * 4;
      const greenI = (greenY * imageSize * greenMultiple + greenX) * 4;
      const blueI = (blueY * imageSize * blueMultiple + blueX) * 4;
      const redAvg = 255 - Math.floor((redData[redI] + redData[redI + 1] + redData[redI + 2]) / 3);
      //const greenI = Math.floor(p / (2 * 2)) * 4;
      //const blueI = Math.floor(p / (10 * 10)) * 4;
      const greenAvg = 255 - Math.floor((greenData[greenI] + greenData[greenI + 1] + greenData[greenI + 2]) / 3);
      const blueAvg = 255 - Math.floor((blueData[blueI] + blueData[blueI + 1] + blueData[blueI + 2]) / 3);
      //console.log('x', p % 100, 'y', Math.floor(p / 100), 'blueI', blueI, blueAvg);
      pData[p * 4] = brighten ? Math.floor(255 * Math.sqrt(Math.sqrt(redAvg / 255))) : redAvg;
      pData[p * 4 + 1] = brighten ? Math.floor(255 * Math.sqrt(Math.sqrt(greenAvg / 255))) : greenAvg;
      pData[p * 4 + 2] = brighten ? Math.floor(255 * Math.sqrt(Math.sqrt(blueAvg / 255))): blueAvg;

      if (pX === imageSize/2 && pY === imageSize/2) {
        pData[p * 4] = 255;
        pData[p * 4 + 1] = 255;
        pData[p * 4 + 2] = 255;
      }
    }

    // Put greyscale image data on greyscale canvas
    smallCtx.putImageData(pImageData, 0, 0);

    // Convert greyscale canvas to data URL and set state
    const dataUrl = smallCanvas.toDataURL('image/png');
    return dataUrl;

  }, [blueMultiple]);

  const createCroppedImage = useCallback((x, y) => {
    const dataUrl = getCroppedImage(x, y);

    setClickData(prevData => [...prevData, { image: dataUrl, class: activeClass, x: Math.round(x), y: Math.round(y) }]);
    setLabels(prevLabels => [...prevLabels, { x, y, label: activeClass, color: labelColors[activeClass] }]);
    

  }, [activeClass, getCroppedImage, labelColors]);


  const runInference = useCallback(async (x, y) => {
    const dataUrl = getCroppedImage(x, y);

    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");

    // Convert base64 to ArrayBuffer
    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    console.log('runInference dataUrl');

    // Function to convert image to proper format
    async function prepareImageData(imageUrl) {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(new Uint8Array(reader.result));
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
      });
    }

    const imgData = await prepareImageData(dataUrl);

    
    const params = {
      Body: imgData,
      EndpointName: projects[activeProject].endpoint,
      ContentType: 'image/png',
      Accept: '*'
    };

    const prom = new Promise((resolve, reject) => {
      sagemakerruntime.invokeEndpoint(params, (err, data) => {
        if (err) reject(err);
        else resolve(JSON.parse(new TextDecoder().decode(data.Body)));
      });
    });

    let result = await prom;
    result = result.map(Number);

    console.log('result', result);

    const maxResult = Math.max(...result);
    const maxIndex = result.indexOf(maxResult);
    let foundClass = projects[activeProject].labels.find(label => label.classNum === String(maxIndex)).abbreviation;

    setLabels(prevLabels => [...prevLabels, { x, y, label: foundClass, color: labelColors[foundClass] }]);
    
    console.log('result', result);
    
  }, [activeProject, getCroppedImage, labelColors]);

  const handleImageClick = (event) => {
    if (imageRef.current) {
      event.clientX -= leftOffset;
      event.clientY -= topOffset;
      if (event.clientX < imagePadding || event.clientX > (imageWidth - imagePadding) || event.clientY < imagePadding || event.clientY > (imageHeight - imagePadding)) {
        return;
      }
      const rect = imageRef.current.getBoundingClientRect();
      //const x = event.clientX - rect.left + cropOffset.x;
      //const y = event.clientY - rect.top + cropOffset.y;

      if (activeClass === 'auto') {
        runInference(event.clientX, event.clientY);
      } else {
        createCroppedImage(event.clientX, event.clientY);
      }
    }
  };

  const downloadClickData = () => {
    //const dataStr = JSON.stringify(clickData, null, 2);
    //const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    //const linkElement = document.createElement('a');
    //linkElement.setAttribute('href', dataUri);
    //linkElement.setAttribute('download', 'click_data.json');
    //linkElement.click();

    //let click = clickData[0];

    clickData.forEach((click, i) => {
      const base64Data = click.image.replace(/^data:image\/png;base64,/, "");

      // Convert base64 to ArrayBuffer
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
      }

      let dataRole = 'train';
      if (Math.random() < 0.15) {
        dataRole = 'validation';
      }
      const params = {
        Bucket: 'newbai-ai-resources',
        Key: `${activeProject}/training/` + dataRole + '/' + click.class + '/' + Date.now() + '-' + Math.floor(Math.random() * 100000000) + '.png',
        Body: bytes.buffer,
        ContentEncoding: 'base64',
        ContentType: 'image/png'
      };

      setTimeout(() => {
        s3.upload(params, (err, data) => {
          if (err) {
            console.error("Error", err);
          } else {
            console.log(dataRole, "Upload Success", data.Location);
          }
        }); 
      }, i * 250)
    });

    setTimeout(async () => {
      const params = {
          Bucket: 'newbai-ai-resources',
          Prefix: `${activeProject}/training/train/`
      };
      
      let manifestData = [];
      let isTruncated = true;
      let continuationToken;

      // List objects in the specified S3 prefix (handling paginated results)
      while (isTruncated) {
          if (continuationToken) {
              params.ContinuationToken = continuationToken;
          }

          const response = await s3.listObjectsV2(params).promise();
          isTruncated = response.IsTruncated;
          continuationToken = response.NextContinuationToken;

          for (let obj of response.Contents) {
              const imageS3Uri = `s3://${'newbai-ai-resources'}/${obj.Key}`;
              // Extract class label from the folder structure (e.g., 'class1' from 'train/class1/image1.jpg')
              const label = obj.Key.split('/')[3]
              console.log('label', label)

              // Create a manifest entry
              const manifestEntry = {
                  "source-ref": imageS3Uri,
                  "class": String(classToNumber[label])
              };
              manifestData.push(manifestEntry);
          }
      }

      console.log('manifestData', manifestData);

      let manifestString = '';
      let lstString = '';
      let lstCount = 0;
      manifestData.forEach((entry, i) => {
        manifestString += JSON.stringify(entry) + '\n';
        let pathAr = entry["source-ref"].split('/');
        let imgName = pathAr[pathAr.length - 1].replace('.png', '');
        if (imgName.includes('-')) {
          let dateStr = imgName.split('-')[0];
          if (Number(dateStr) > 1729187213055) {
            lstString += `${i}\t${entry["class"]}\t${entry["source-ref"].replace(`s3://newbai-ai-resources/${activeProject}/training/`,"")}\n`;
            lstCount += 1;
          }
        }
      });
      console.log('lstCount', lstCount);
      const manifestParams = {
        Bucket: 'newbai-ai-resources',
        Key: `${activeProject}/training/training_manifest.json`,
        Body: manifestString,
        ContentType: 'application/json'
      };

      s3.upload(manifestParams, (err, data) => {
        if (err) {
          console.error("Error", err);
        } else {
          console.log("Upload Success", data.Location);
        }
      });

      const lstParams = {
        Bucket: 'newbai-ai-resources',
        Key: `${activeProject}/training/train_lst/train_lst.lst`,
        Body: lstString,
        ContentType: 'text/html'
      };

      s3.upload(lstParams, (err, data) => {
        if (err) {
          console.error("Error", err);
        } else {
          console.log("Upload Success", data.Location);
        }
      });

      console.log('lstString', lstString);
      
    }, clickData.length * 250 + 1000)

    setTimeout(async () => {
      const params = {
          Bucket: 'newbai-ai-resources',
          Prefix: `${activeProject}/training/validation/`
      };
      
      let manifestData = [];
      let isTruncated = true;
      let continuationToken;

      // List objects in the specified S3 prefix (handling paginated results)
      while (isTruncated) {
          if (continuationToken) {
              params.ContinuationToken = continuationToken;
          }

          const response = await s3.listObjectsV2(params).promise();
          isTruncated = response.IsTruncated;
          continuationToken = response.NextContinuationToken;

          for (let obj of response.Contents) {
              const imageS3Uri = `s3://${'newbai-ai-resources'}/${obj.Key}`;
              // Extract class label from the folder structure (e.g., 'class1' from 'train/class1/image1.jpg')
              const label = obj.Key.split('/')[3]
              console.log('label', label)

              // Create a manifest entry
              const manifestEntry = {
                  "source-ref": imageS3Uri,
                  "class": String(classToNumber[label])
              };
              manifestData.push(manifestEntry);
          }
      }

      console.log('manifestData', manifestData);

      let manifestString = '';
      let lstString = '';
      manifestData.forEach((entry, i) => {
        manifestString += JSON.stringify(entry) + '\n';
        let pathAr = entry["source-ref"].split('/');
        let imgName = pathAr[pathAr.length - 1].replace('.png', '');
        if (imgName.includes('-')) {
          let dateStr = imgName.split('-')[0];
          if (Number(dateStr) > 1729187213055) {
            lstString += `${i}\t${entry["class"]}\t${entry["source-ref"].replace(`s3://newbai-ai-resources/${activeProject}/training/`,"")}\n`;
          }
        }
      });
      const manifestParams = {
        Bucket: 'newbai-ai-resources',
        Key: `${activeProject}/training/validation_manifest.json`,
        Body: manifestString,
        ContentType: 'application/json'
      };

      s3.upload(manifestParams, (err, data) => {
        if (err) {
          console.error("Error", err);
        } else {
          console.log("Upload Success", data.Location);
        }
      });

      const lstParams = {
        Bucket: 'newbai-ai-resources',
        Key: `${activeProject}/training/validation_lst/validation_lst.lst`,
        Body: lstString,
        ContentType: 'text/html'
      };

      s3.upload(lstParams, (err, data) => {
        if (err) {
          console.error("Error", err);
        } else {
          console.log("Upload Success", data.Location);
        }
      });

    }, clickData.length * 250 + 1000)

    setClickData([]);

  };


  return (
    <div className="App" style={{
      width: '100%',
      height: `${windowHeight}px`,
      overflow: 'hidden'
    }}>
      {activeClass === 'auto' && (<div style={{
        pointerEvents: 'none',
        position: 'absolute',
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        bottom: 20,
        left: maxWidth / 2 - 200,
        width: 400,
        zIndex: 5,
        backgroundColor: labelColors[activeClass] || '#eee',
        padding: 12,
        borderRadius: '8px'
      }}>Click on the image to run inference</div>)}
      {activeClass !== 'auto' && (<div style={{
        pointerEvents: 'none',
        position: 'absolute',
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        bottom: 20,
        left: maxWidth / 2 - 200,
        width: 400,
        zIndex: 5,
        backgroundColor: labelColors[activeClass] || '#fff',
        padding: 12,
        borderRadius: '8px'
      }}>Click on the image to add a <span>{labelNames[activeClass]}</span> label</div>)}
      
      <div style={{
        overflow: 'hidden',
        width: `${maxWidth - leftOffset}px`,
        height: `${maxHeight - topOffset}px`,
        position: 'relative',
        top: `${topOffset}px`, 
        left: `${leftOffset}px`
      }}>
        <canvas ref={canvasRef} style={{ display: 'none', position: 'absolute', top: `0px`, left: `0px`, zIndex: 1 }} />
        <canvas ref={maskCanvasRef} style={{ pointerEvents: 'none', display: projects[activeProject].masks && croppedImageUrl && maskOn ? 'block' : 'none', opacity: '1', position: 'absolute', top: `0px`, left: `0px`, zIndex: 2 }} />
      
      <div style={{
        pointerEvents: 'none',
        border: '1px dashed #000',
        position: 'absolute',
        zIndex: 4,
        top: imagePadding,
        left: imagePadding,
        width: imageWidth - imagePadding * 2 - 2,
        height: imageHeight - imagePadding * 2 - 2
      }}></div>
      <div style={{
        backgroundColor: 'rgba(0,0,0,0.7)',
        position: 'absolute',
        zIndex: 4,
        top: 0,
        left: 0,
        width: imagePadding,
        height: imageHeight
      }}></div>
      <div style={{
        backgroundColor: 'rgba(0,0,0,0.7)',
        position: 'absolute',
        zIndex: 4,
        top: 0,
        left: imageWidth - imagePadding,
        width: imagePadding,
        height: imageHeight
      }}></div>
      <div style={{
        backgroundColor: 'rgba(0,0,0,0.7)',
        position: 'absolute',
        zIndex: 4,
        top: 0,
        left: imagePadding,
        width: imageWidth - imagePadding * 2,
        height: imagePadding
      }}></div>
      <div style={{
        backgroundColor: 'rgba(0,0,0,0.7)',
        position: 'absolute',
        zIndex: 4,
        top: imageHeight - imagePadding,
        left: imagePadding,
        width: imageWidth - imagePadding * 2,
        height: imagePadding
      }}></div>
      {labels.map((label, index) => (
        <div key={index} style={{
            position: 'absolute',
            top: label.y - 7,
            left: label.x - 7,
            color: '#000',
            fontSize: '10px',
            fontWeight: 'bold',
            pointerEvents: 'none', 
            backgroundColor: label.color, 
            borderRadius: '50%', 
            width: '14px', 
            height: '14px',
            textAlign: 'center',
            borderColor: '#000',
            borderWidth: '1px',
            borderStyle: 'solid',
            zIndex: 6
        }}>{label.label}</div>
      ))}
      {croppedImageUrl && (
        <div
          onClick={handleImageClick}
        ><img 
          ref={imageRef}
          src={croppedImageUrl} 
          alt="Cropped random section" 
          style={{ cursor: 'crosshair', pointerEvents: 'none' }}
        /></div>
      )}
      {!croppedImageUrl && (
        <div style={{
          width: `${imageWidth}px`,
          flexCollapse: '0',
          height: `${imageHeight / 2}px`,
          textAlign: 'center',
          paddingTop: `${imageHeight / 2}px`
        }}><CircularProgress/></div>
      )}
      </div>
      <div style={{
          width: '500px',
          position: 'absolute',
          right: '0px',
          top: '0px',
          overflow: 'hidden'
        }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column'
        }}>
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            width: '500px',
            padding: '8px'
          }}>
          <div style={{
            fontSize: '14px',
            flexDirection: 'row',
            width: '244px'
          }}>
            Project:
          <Select 
            value={activeProject}
            style={{
              width: '170px',
              height: '24px',
              fontSize: '14px',
              marginLeft: '12px'
            }}
            onChange={(e) => {
            console.log('onChange', e.target.value);
            setLabels([])
            setClickData(() => []);
            setActiveProject(e.target.value);
          }}>
            {Object.values(projects).map(project => (
              <MenuItem value={project.name}>{project.displayName}</MenuItem>  
            ))}
          </Select>
          </div>
          <div style={{
            fontSize: '14px',
            flexDirection: 'row',
            width: '244px'
          }}>
            Label:
          <Select 
            value={activeClass}
            style={{
              width: '170px',
              height: '24px',
              fontSize: '14px',
              marginLeft: '12px'
            }}
            onChange={(e) => {
            console.log('onChange', e.target.value);
            setActiveClass(e.target.value);
          }}>
            {projects[activeProject].labels.map(label => (
              <MenuItem value={label.abbreviation}>{label.name}</MenuItem>
            ))}
            <MenuItem value="auto">Auto</MenuItem>
          </Select>
          </div>
          </div>
          <div style={{
            marginBottom: '8px'
          }}>
          <Button 
            style={{
              fontSize: '12px',
              padding: '4px 10px',
              margin: '4px',
              textTransform: 'none'
            }}
            variant="contained" onClick={() => {
            setLabels([])
            setCroppedImageUrl(null);
            grabRandomCrop();
          }}>New Image</Button>
          <Button
            style={{
              fontSize: '12px',
              padding: '4px 10px',
              margin: '4px',
              textTransform: 'none'
            }}
             variant="contained" onClick={() => {
            setLabels([])
            setClickData(() => []);
          }}>Clear Labels</Button>
          <Button
            style={{
              fontSize: '12px',
              padding: '4px 10px',
              margin: '4px',
              textTransform: 'none'
            }}
             variant="contained" onClick={() => {
            setClickData(prevData => prevData.slice(0, -1));
            setLabels(prevData => prevData.slice(0, -1));
          }}>Undo</Button>
          <Button
            style={{
              fontSize: '12px',
              padding: '4px 10px',
              margin: '4px',
              textTransform: 'none'
            }}
             variant="contained" onClick={() => {
            downloadClickData();
          }}>Save Labels</Button>
          {projects[activeProject].masks && <Button
            style={{
              fontSize: '12px',
              padding: '4px 10px',
              margin: '4px',
              textTransform: 'none'
            }}
             variant="contained" onClick={() => {
            setMaskOn(!maskOn);
          }}>{maskOn ? 'Disable Mask' : 'Enable Mask'}</Button>}

          <div style={{
            zIndex: 10,
            display: 'flex',
            flexDirection: 'row',
            width: 'auto',
            left: '50%',
            transform: 'translateX(-50%)',
            position: 'absolute'
          }}>
            {activeLabels.map((label, index) => (
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                padding: '4px 14px'
              }}>
                <div key={index} style={{
                top: label.y - 7,
                left: label.x - 7,
                color: '#000',
                fontSize: '10px',
                fontWeight: 'bold',
                pointerEvents: 'none', 
                backgroundColor: label.color, 
                borderRadius: '50%', 
                width: '14px', 
                height: '14px',
                textAlign: 'center',
                borderColor: '#000',
                borderWidth: '1px',
                borderStyle: 'solid',
                marginRight: '4px',
                whiteSpace: 'nowrap'
            }}>{label.abbreviation}</div>
            <div style={{
              whiteSpace: 'nowrap'
            }}>{label.name}</div>
              </div>
            ))}
          </div>
        </div>
        </div>
        <textarea style={{ marginTop: '18px', width: '500px', height: `${windowHeight - 236}px` }} value={JSON.stringify(textClickData, null, 2)} />
      </div>
      <div style={{ border: '3px solid red', position: 'absolute', bottom: '10px', right: '376px', width: '104px', height: '104px' }}>
        <canvas ref={redCanvasRef} width={"100px"} height={"100px"} style={{ border: '2px solid white', width: '100px', height: '100px' }} />
      </div>
      <div style={{ border: '3px solid green', position: 'absolute', bottom: '10px', right: '256px', width: '104px', height: '104px' }}>
        <canvas ref={greenCanvasRef} width={"100px"} height={"100px"} style={{ border: '2px solid white', width: '100px', height: '100px' }} />
      </div>
      <div style={{ border: '3px solid blue', position: 'absolute', bottom: '10px', right: '136px', width: '104px', height: '104px' }}>
        <canvas ref={blueCanvasRef} width={"100px"} height={"100px"} style={{ border: '2px solid white', width: '100px', height: '100px' }} />
      </div>
      <div style={{ border: '3px solid black', position: 'absolute', bottom: '10px', right: '16px', width: '104px', height: '104px' }}>
        <canvas ref={smallCanvasRef} width={"100px"} height={"100px"} style={{ border: '2px solid white', width: '100px', height: '100px' }} />
      </div>
    </div>);
}

export default App;