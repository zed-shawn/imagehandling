import React, { useState, useEffect } from "react";
import { Button, Image, View, Platform, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FaceDetector from "expo-face-detector";
import {} from "cloudinary-react";

const url = "https://api.cloudinary.com/v1_1/fsduhag8/image/upload";

export default function App() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState();
  // const [faces, setFaces] = useState();

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const {
          status,
        } = await ImagePicker.requestCameraRollPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }
      }
    })();
  }, []);
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    //console.log(result);
    const faceDetect = await detectFaces(result.uri);
    //console.log("faceDetect", faceDetect);
    const numFaces = faceDetect.faces.length;
    if (numFaces === 1) {
      dimCheck(faceDetect);
    } else if (numFaces === 0) {
      setResult(
        "We're having trouble detecting a face. Please try another picture or different lighting :("
      );
    } else if (numFaces > 1) {
      setResult("Bummer! More than one faces found. Please try again :(");
    }

    // setFaces(numFaces);
    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const detectFaces = async (imageUri) => {
    const options = { mode: FaceDetector.Constants.Mode.fast };
    return await FaceDetector.detectFacesAsync(imageUri, options);
  };

  const dimCheck = (resultObj) => {
    //  console.log("resultObj",resultObj);

    const picWidth = resultObj.image.width;
    const picHeight = resultObj.image.height;
    const imgArea = picHeight * picWidth;

    const faceWidth = resultObj.faces[0].bounds.size.width;
    const faceHeight = resultObj.faces[0].bounds.size.height;
    const faceArea = faceWidth * faceHeight;

    const percentFace = faceArea / imgArea;
    console.log(percentFace);

    if (percentFace < 0.1) {
      setResult(
        "The face seems small, please retry by zooming in or try another pic :)"
      );
    } else if (percentFace >= 0.1 && percentFace <= 1) {
      setResult("C'est parfait!! :D");
      uploadHandler(resultObj.image.uri);
    } else if (percentFace > 1) {
      setResult("Something's not right. Please try again or another pic :/");
    }
  };

  const uploadHandler = (file) => {
    console.log("Upload handler called");
    const fileData = { uri: file, type: "jpg" };
    const formData = new FormData();
    formData.append("file", fileData);
    formData.append("upload_preset", "trialpic");

    console.log("formData", formData);

    fetch("https://api.cloudinary.com/v1_1/fsduhag8/image/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        jresp = JSON.stringify(response);
        console.log("Upload response", jresp);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
      <Text>{result}</Text>
    </View>
  );
}
