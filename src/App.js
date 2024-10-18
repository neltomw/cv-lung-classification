import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import AWS from 'aws-sdk';

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
  region: process.env.REGION
});

// Create S3 service object
const s3 = new AWS.S3();

const imageWidth = 2400;
const imageHeight = 1800;




const images = [
'/images/ISH061918_EPAS1_R6071_1Days_D109-LUL-9A1_1.4_s2.png',
'/images/ISH120318_EFNB1_R6069_2_2Months_D092-LUL-9B1_7.5_s1.png',
'/images/ISH061918_EPAS1_R6071_1Days_D109-LUL-9A1_1.4_s1.png'
]

function App() {
  const [imageUrl, setImageUrl] = useState(images[Math.floor(Math.random() * images.length)]);
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const [clickData, setClickData] = useState([]);
  const [activeClass, setActiveClass] = useState('S');
  const [labels, setLabels] = useState([]);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const smallCanvasRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Calculate random crop coordinates
      const maxX = Math.max(0, img.width - imageWidth);
      const maxY = Math.max(0, img.height - imageHeight);
      const x = Math.floor(Math.random() * maxX);
      const y = Math.floor(Math.random() * maxY);

      setCropOffset({ x, y });

      // Set canvas size and draw cropped image
      canvas.width = imageWidth;
      canvas.height = imageHeight;
      ctx.drawImage(img, x, y, imageWidth, imageHeight, 0, 0, imageWidth, imageHeight);

      // Convert canvas to data URL and set state
      const dataUrl = canvas.toDataURL('image/png');
      setCroppedImageUrl(dataUrl);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const imageSize = 50;
  const redMultiple = 24;
  const greenMultiple = 8;
  const blueMultiple = 1;

  const labelColors = useMemo(() => ({
    S: '#a00',
    A: '#0a0',
    D: '#00a'
  }), []);

  const labelNames = useMemo(() => ({
    S: 'SEPTA',
    A: 'ALVIOLI',
    D: 'DUCT'
  }), []);

  const createCroppedImage = useCallback((x, y) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const smallCanvas = smallCanvasRef.current;
    const smallCtx = smallCanvas.getContext('2d');
    smallCanvas.width = imageSize;
    smallCanvas.height = imageSize;

    smallCtx.clearRect(0, 0, smallCanvas.width, smallCanvas.height);
    //smallCtx.drawImage(canvas, x - 50, y - 50, 100, 100, 0, 0, 100, 100);


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
      pData[p * 4] = Math.floor(255 * Math.sqrt(Math.sqrt(redAvg / 255)));
      pData[p * 4 + 1] = Math.floor(255 * Math.sqrt(Math.sqrt(greenAvg / 255)));
      pData[p * 4 + 2] = Math.floor(255 * Math.sqrt(Math.sqrt(blueAvg / 255)));

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

    setClickData(prevData => [...prevData, { image: dataUrl, class: activeClass }]);
    setLabels(prevLabels => [...prevLabels, { x, y, label: activeClass, color: labelColors[activeClass] }]);
    

  }, [activeClass, blueMultiple, labelColors]);


  const imagePadding = imageSize * Math.max(redMultiple, greenMultiple, blueMultiple) / 2;

  const handleImageClick = (event) => {
    if (imageRef.current) {
      if (event.clientX < imagePadding || event.clientX > (imageWidth - imagePadding) || event.clientY < imagePadding || event.clientY > (imageHeight - imagePadding)) {
        return;
      }
      const rect = imageRef.current.getBoundingClientRect();
      //const x = event.clientX - rect.left + cropOffset.x;
      //const y = event.clientY - rect.top + cropOffset.y;
      createCroppedImage(event.clientX, event.clientY);
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
        Key: 'lung/training/' + dataRole + '/' + click.class + '/' + Date.now() + '-' + Math.floor(Math.random() * 100000000) + '.png',
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

    const classToNumber = {
      'A': 0,
      'D': 1,
      'S': 2
    }

    setTimeout(async () => {
      const params = {
          Bucket: 'newbai-ai-resources',
          Prefix: 'lung/training/train/'
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

      // Write the manifest data to a local file
      //fs.writeFileSync(outputFile, manifestData.map(entry => JSON.stringify(entry)).join('\n'));
      //console.log(`Manifest file ${outputFile} created with ${manifestData.length} entries.`);
      console.log('manifestData', manifestData);

      let manifestString = '';
      manifestData.forEach((entry) => {
        manifestString += JSON.stringify(entry) + '\n';
      });
      const manifestParams = {
        Bucket: 'newbai-ai-resources',
        Key: 'lung/training/training_manifest.json',
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

    }, clickData.length * 250 + 1000)

    setTimeout(async () => {
      const params = {
          Bucket: 'newbai-ai-resources',
          Prefix: 'lung/training/validation/'
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

      // Write the manifest data to a local file
      //fs.writeFileSync(outputFile, manifestData.map(entry => JSON.stringify(entry)).join('\n'));
      //console.log(`Manifest file ${outputFile} created with ${manifestData.length} entries.`);
      console.log('manifestData', manifestData);

      let manifestString = '';
      manifestData.forEach((entry) => {
        manifestString += JSON.stringify(entry) + '\n';
      });
      const manifestParams = {
        Bucket: 'newbai-ai-resources',
        Key: 'lung/training/validation_manifest.json',
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

    }, clickData.length * 250 + 1000)

    setClickData([]);

  };

  return (
    <div className="App" style={{
      display: 'flex',
      flexDirection: 'row'
    }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div style={{
        pointerEvents: 'none',
        position: 'absolute',
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        top: imageHeight - imagePadding / 2,
        left: 0,
        width: imageWidth,
        zIndex: 3
      }}>Click on the image to add a <span style={{
        color: labelColors[activeClass],
        backgroundColor: '#fff'
      }}>{labelNames[activeClass]}</span> label</div>
      <div style={{
        pointerEvents: 'none',
        border: '1px dashed #000',
        position: 'absolute',
        top: imagePadding,
        left: imagePadding,
        width: imageWidth - imagePadding * 2 - 2,
        height: imageHeight - imagePadding * 2 - 2
      }}></div>
      <div style={{
        backgroundColor: 'rgba(0,0,0,0.7)',
        position: 'absolute',
        top: 0,
        left: 0,
        width: imagePadding,
        height: imageHeight
      }}></div>
      <div style={{
        backgroundColor: 'rgba(0,0,0,0.7)',
        position: 'absolute',
        top: 0,
        left: imageWidth - imagePadding,
        width: imagePadding,
        height: imageHeight
      }}></div>
      <div style={{
        backgroundColor: 'rgba(0,0,0,0.7)',
        position: 'absolute',
        top: 0,
        left: imagePadding,
        width: imageWidth - imagePadding * 2,
        height: imagePadding
      }}></div>
      <div style={{
        backgroundColor: 'rgba(0,0,0,0.7)',
        position: 'absolute',
        top: imageHeight - imagePadding,
        left: imagePadding,
        width: imageWidth - imagePadding * 2,
        height: imagePadding
      }}></div>
      {labels.map((label, index) => (
        <div key={index} style={{
            position: 'absolute',
            top: label.y - 5,
            left: label.x - 5,
            color: label.color,
            fontSize: '8px',
            fontWeight: 'bold',
            pointerEvents: 'none', 
            backgroundColor: '#fff', 
            borderRadius: '50%', 
            width: '10px', 
            height: '10px',
            textAlign: 'center',
            borderColor: label.color,
            borderWidth: '1px',
            borderStyle: 'solid'
        }}>{label.label}</div>
      ))}
      {croppedImageUrl && (
        <img 
          ref={imageRef}
          src={croppedImageUrl} 
          alt="Cropped random section" 
          onClick={handleImageClick}
          style={{ cursor: 'crosshair' }}
        />
      )}
      {!croppedImageUrl && (
        <div style={{
          width: `${imageHeight}px`,
          flexCollapse: '0',
          height: `${imageWidth / 2}px`,
          textAlign: 'center',
          paddingTop: `${imageWidth / 2}px`
        }}>loading</div>
      )}
      <div style={{
          display: 'flex',
          flexDirection: 'column',
          width: `calc(100% - ${imageWidth + 150}px)`
        }}>
        <div style={{
            display: 'flex',
            flexDirection: 'row'
          }}>
          <select onChange={(e) => {
            console.log('onChange', e.target.value);
            setActiveClass(e.target.value);
          }}>
            <option value="S">Septa</option>
            <option value="A">Alvioli</option>
            <option value="D">Duct</option>
          </select>
          <button onClick={() => {
            setLabels([])
            setCroppedImageUrl(null);
            setImageUrl(images[Math.floor(Math.random() * images.length)]);
          }}>New Image</button>
          <button onClick={() => {
            setLabels([])
            setClickData(() => []);
          }}>Clear Data</button>
          <button onClick={() => {
            setClickData(prevData => prevData.slice(0, -1));
            setLabels(prevData => prevData.slice(0, -1));
          }}>Undo</button>
          <button onClick={() => {
            downloadClickData();
          }}>Download Clicks</button>
        </div>
        <textarea style={{ width: '100%', height: '100%' }} value={JSON.stringify(clickData, null, 2)} />
      </div>
      <canvas ref={smallCanvasRef} width={"100px"} height={"100px"} style={{ marginTop: '10px', marginLeft: '20px', width: '100px', height: '100px' }} />
    </div>
  );
}

export default App;