import { ethers } from "./ethers-5.6.esm.min.js";
import { vrfABI } from "./vrfABI.js";

// Define the VRF contract address as a string
const VRFcontractAddress = "0xf880B0C7c119b26e2aAFb5de17f50a05DF2f913e";

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("getRandomNumber")
    .addEventListener("click", async () => {
      try {
        // Check if MetaMask is installed
        if (typeof window.ethereum !== "undefined") {
          // Request account access if needed
          await window.ethereum.request({ method: "eth_requestAccounts" });

          // Create a new provider from MetaMask
          const provider = new ethers.providers.Web3Provider(window.ethereum);

          // Get the signer (the user)
          const signer = provider.getSigner();

          // Create a contract instance
          const myContract = new ethers.Contract(
            VRFcontractAddress,
            vrfABI,
            signer
          );

          const maxValueInput = document.getElementById("maxValueInput").value;
          if (!maxValueInput || isNaN(maxValueInput)) {
            console.error("Please enter a valid maximum value.");
            return;
          }

          const maxValue = ethers.BigNumber.from(maxValueInput);

          const txResult = await myContract.requestRandomWords(false);
          const resultRecipt = await txResult.wait();
          console.log("The transaction result receipt:", resultRecipt);

          const lastRequestId = await myContract.lastRequestId();
          console.log("Last request ID:", lastRequestId);

          let fulfilled = false;
          let randomNumberArray = [];

          // Polling to check if the request has been fulfilled
          while (!fulfilled) {
            const [requestFulfilled, randomWords] =
              await myContract.getRequestStatus(lastRequestId);
            if (requestFulfilled) {
              fulfilled = true;
              randomNumberArray = randomWords;
              break;
            } else {
              console.log("Waiting for the request to be fulfilled...");
              await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before checking again
            }
          }

          if (fulfilled && randomNumberArray.length > 0) {
            const firstRandomNumber = ethers.BigNumber.from(
              randomNumberArray[0]
            );
            const randomWithinRange = firstRandomNumber
              .mod(maxValue)
              .toString();
            console.log(
              "The random number within range is: ",
              randomWithinRange
            );

            // Display the random number
            document.getElementById("randomNumberDisplay").innerText =
              "Random Number: " + randomWithinRange;

            // Display the Etherscan link
            const transactionHash = resultRecipt.transactionHash;
            const etherscanUrl = `https://sepolia.etherscan.io/tx/${transactionHash}`;
            document.getElementById(
              "etherscanLink"
            ).innerHTML = `<a href="${etherscanUrl}" target="_blank">View Transaction on Etherscan</a>`;
          } else {
            console.log(
              "Random words request not fulfilled or array is empty."
            );
          }
        } else {
          console.error("MetaMask is not installed!");
        }
      } catch (error) {
        console.error("Error interacting with contract:", error);
      }
    });
});
