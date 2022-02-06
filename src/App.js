import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import React, { useState,useEffect } from "react";
import Header from './components/Header';
import Footer from './components/Footer';
import Content from './components/Containers';
import { Container, Image } from 'semantic-ui-react';
import TextField from '@mui/material/TextField';
import SendIcon from '@mui/icons-material/Send';
import {Grid, Label, Icon, Transition} from 'semantic-ui-react'
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Button from '@mui/material/Button';
import './App.css';
import axios from 'axios';
import ShakaPlayer from 'shaka-player-react';
import "shaka-player/dist/controls.css";
import { NFTStorage, File, Blob } from "nft.storage";

const getLibrary = (provider) => {
  const library = new Web3Provider(provider);
  library.pollingInterval = 8000;
  return library;
};

function App() {
  //1. LivePeer
  const Livepeer = require("livepeer-nodejs");
  const apiKey = "20d69c53-f581-4241-9598-3d2c22aef5a1";
  console.log(apiKey);
  const livepeerObject = new Livepeer(apiKey);
  const [data, setData] = useState(null);
  const [streamUrl, setStreamUrl] = useState(null);
  const [showButton, setShowButton] = useState(false);

  const [nameOfNft, setNameOfNft] = useState("");
  const [descriptionOfNft, setDescriptionOfNft] = useState("");
  const [address, setAddress] = useState("");

  const [nftDeployedUrl, setNftDeployedUrl] = useState("");
  const [mintedNFT, setMintedNFT] = useState(null);
  const [covalentData, setCovalentData] = useState(null);

  const[mintedArray,setMintedArray] = useState([]);

  const content = {
    "name": "Streams",
    "profiles": [
      {
        "name": "720p",
        "bitrate": 2000000,
        "fps": 30,
        "width": 1280,
        "height": 720
      },
      {
        "name": "480p",
        "bitrate": 1000000,
        "fps": 30,
        "width": 854,
        "height": 480
      },
      {
        "name": "360p",
        "bitrate": 500000,
        "fps": 30,
        "width": 640,
        "height": 360
      },
    ],
    "record": true
  };


  const startStream = () => {
    livepeerObject.Stream.create(content).then((res) => {
      setData(res);
      setShowButton(true);
    });
  };

  const getStreamUrl = async () => {
    const url = `https://livepeer.com/api/session?limit=20&parentId=${data.id}`;

    const listOfAllStreams = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (listOfAllStreams.data.length === 0) {
      alert("No stream detected");
      return;
    }

    setStreamUrl(listOfAllStreams.data[0].mp4Url);

    if (streamUrl === "") alert("Stream is currently processing!! Please have some Patience :)");
  };

  //--------------------------------------------------------------------
  // 2. NFTPort
  const mintStream = async (e) => {
    e.preventDefault();
    if (streamUrl === "") {
      alert("Stream is Processing!! Please Wait :) ");
      return;
    }
    if (streamUrl === null) {
      alert("No Stream Detected!!");
      return;
    }

    alert("Wait for Stream to get Minted!!");

    const nftPortApiKey = "702a0efe-0092-4ee6-adee-f0e396774018";
    console.log(nftPortApiKey);

    //Minting NFTs using NFTPort
    const urlToMint = "https://api.nftport.xyz/v0/mints/easy/urls"
    const body = {
      "chain": "rinkeby",
      "name": nameOfNft, 
      "description": descriptionOfNft, 
      "file_url": streamUrl,
      "mint_to_address": address
    };

    const auth = {
      headers: {
        Authorization: nftPortApiKey
      }
    };

    const res = await axios.post(urlToMint, body, auth);

    //Retrieve Minted NFTs using NFTPort
    const options = {
      method: 'GET',
      url: 'https://api.nftport.xyz/v0/me/mints',
      headers: {
        'Content-Type': 'application/json',
        Authorization: '702a0efe-0092-4ee6-adee-f0e396774018'
      }
    };

    
    await axios.request(options).then(function (response) {
      console.log(response.data);
      setMintedNFT(response.data);
      setMintedArray(response.data.minted_nfts);
    }).catch(function (error) {
      console.error(error);
    });


    if (res.status === 200) {
      alert("Hurray !! Your Stream is Successfully Minted!!");
      setNameOfNft("");
      setDescriptionOfNft("");
      // setAddress("");
      setNftDeployedUrl(res.data.transaction_external_url);

      //--------------------------------------------------------------------

      // 3. NFTStorage
      const client = new NFTStorage({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDU2NGI0NjlFYTVlZTIxODNiNDQxNTUwMWRCQWYxNzBiQjdDYTkxOGMiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY0Mzg5MjU0MjAxMiwibmFtZSI6IlJvYWRUb1dlYjMifQ.RX2pyQuez7jOnNLa0OZFUkGzT2iWqn8MIpQIiAiMIqI" });
      const cid = await client.storeBlob(new Blob([{
        chain: res.data.chain,
        contract_address: res.data.contract_address,
        transaction_hash: res.data.transaction_hash,
        description: res.data.description,
        address: res.data.mint_to_address
      }]));

      //--------------------------------------------------------------------

      //4. Covalent
      const covalent = "https://api.covalenthq.com/v1/1/address/" + address + "/transactions_v2/?quote-currency=USD&format=JSON&block-signed-at-asc=false&no-logs=false&key=" + "ckey_9330b642fdfb41c2ab4593fe705";
      const covalentRes = await axios.get(covalent);
      setCovalentData(covalentRes.data.data);
      console.log(covalentRes.data.data);
    } else {
      alert("Error minting stream");
    }
  }

  const copyData = () => {
    navigator.clipboard.writeText(JSON.stringify(covalentData));
  }

  const copyDataURL = () => {
    navigator.clipboard.writeText((data.streamKey));
  }

  const copyDataServer = () => {
    navigator.clipboard.writeText("rtmp://rtmp.livepeer.com/live");
  }

  //--------------------------------------------------------------------
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <div className='App' >
        <Header />
        <Content>
          <Container text textAlign='center'>
            <div style={{ fontFamily: "cursive" }}>
              <b>Url:</b> {streamUrl !== "" && streamUrl !== null ? <b>{streamUrl}</b> : streamUrl === "" ? <b>Stream Currently Processing!! Please Wait :)</b> : <b>No Streams Created :(</b>}
            </div>
            <br />
            <Button variant="contained" onClick={startStream} endIcon={<SendIcon />}>
              Stream Video
            </Button>
            {data ? <h4 style={{ fontFamily: "cursive" }}>Stream key: {data.streamKey}  <Icon onClick={() => copyDataURL()} name="copy outline icon" /></h4> : null}
            <h4 style={{ fontFamily: "cursive" }}>Server: rtmp://rtmp.livepeer.com/live  <Icon onClick={() => copyDataServer()} name="copy outline icon" /></h4>
            <br></br>
            {showButton ? <Button onClick={getStreamUrl} variant="contained">Play Video</Button> : null}
            <br /><br />
            <div className="video-container">
              {streamUrl !== "" && streamUrl != null ? <ShakaPlayer src={streamUrl} /> : <h3 style={{ marginTop: "15%" }}>Video Loading...</h3>}
            </div>
            <br /><br />
            {
              nftDeployedUrl !== "" ? <a href={nftDeployedUrl} target="_blank">View Transaction</a> : null
            }
            <br /><br />
            <form >
              <TextField
                value={nameOfNft}
                type="text"
                placeholder="Name of NFT"
                onChange={(e) => setNameOfNft(e.target.value)}
                name="nameOfNft"
                label="Name"
                required
              />
              <br></br>
              <br></br>
              <TextField
                value={descriptionOfNft}
                type="text"
                placeholder="Description of NFT"
                onChange={(e) => setDescriptionOfNft(e.target.value)}
                name="descriptionOfNft"
                variant="outlined"
                label="Description"
                required
              />
              <br></br>
              <br></br>
              <TextField
                value={address}
                type="text"
                placeholder="Wallet Address"
                onChange={(e) => setAddress(e.target.value)}
                name="address"
                variant="outlined"
                label="Address"
                required
              />
              <br></br>
              <br></br>

              <Button
                type="submit"
                color="secondary"
                variant="contained"
                size="large"
                onClick={mintStream}
                startIcon={<CloudUploadIcon />}
              >
                Mint
              </Button>
            </form>
            <br></br>
            <br></br>
            <br></br>
            {
              covalentData !== null ? <><h1 style={{ fontFamily: "cursive", fontStyle: "oblique" }}>Transaction Status </h1> <br></br><b style={{fontFamily:"cursive"}}>Address :</b> {covalentData.address} <br></br><b style={{fontFamily:"cursive"}}> Updated At : </b>{covalentData.updated_at} <br></br><b style={{fontFamily:"cursive"}}> Next Update :</b> {covalentData.next_update_at} <br></br><b style={{fontFamily:"cursive"}}> Quote Currency : </b>{covalentData.quote_currency} <br></br> <b style={{fontFamily:"cursive"}}>Chain ID:</b> {covalentData.chain_id}</> : null
            }
            <br></br>
            <br></br>
            {
              mintedNFT !== null ? 
              <>
              <h1 style={{ fontFamily: "cursive", fontStyle: "oblique" }}>Minted NFT's by User </h1> 
              <br></br>
              <table>
                  <tr>
                    <th style={{ fontFamily: "cursive" }}>Chain</th>
                    <th style={{ fontFamily: "cursive" }}>Transaction Hash</th>
                    <th style={{ fontFamily: "cursive" }}>Contract Address</th>
                    <th style={{ fontFamily: "cursive" }}>Contract Name</th>
                  </tr>
                  <tr>
                    <td>rinkeby</td>
                    <td>{mintedNFT.transaction_hash[0]}</td>
                    <td>0xf18ee101d2081478ce68eab4e6b8f7cb0fbbed4e</td>
                    <td>'NFTPort.xyz'</td>
                  </tr>
                  <tr>
                    <td>rinkeby</td>
                    <td>{mintedNFT.transaction_hash[1]}</td>
                    <td>0xf18ee101d2081478ce68eab4e6b8f7cb0fbbed4e</td>
                    <td>'NFTPort.xyz'</td>
                  </tr>
                  <tr>
                    <td>rinkeby</td>
                    <td>{mintedNFT.transaction_hash[2]}</td>
                    <td>0xf18ee101d2081478ce68eab4e6b8f7cb0fbbed4e</td>
                    <td>'NFTPort.xyz'</td>
                  </tr>
                  <tr>
                    <td>rinkeby</td>
                    <td>{mintedNFT.transaction_hash[3]}</td>
                    <td>0xf18ee101d2081478ce68eab4e6b8f7cb0fbbed4e</td>
                    <td>'NFTPort.xyz'</td>
                  </tr>
                  <tr>
                    <td>rinkeby</td>
                    <td>{mintedNFT.transaction_hash[4]}</td>
                    <td>0xf18ee101d2081478ce68eab4e6b8f7cb0fbbed4e</td>
                    <td>'NFTPort.xyz'</td>
                  </tr>
                  <tr>
                    <td>rinkeby</td>
                    <td>{mintedNFT.transaction_hash[5]}</td>
                    <td>0xf18ee101d2081478ce68eab4e6b8f7cb0fbbed4e</td>
                    <td>'NFTPort.xyz'</td>
                  </tr>
                </table>
                
              {/* 
              {console.log({JSON.stringify(mintedNFT)}) 
              */}
              </> : null
            }
            {
              console.log(mintedNFT)
              
            }
            {
              console.log(covalentData)
            }
          </Container>
        </Content>
        <Footer />
      </div>
    </Web3ReactProvider>
  );
}

export default App;
