"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import ContractAddress from "@/contracts/nestedMapping-address.json";
import abi from "@/contracts/NestedMapping.json";

interface StateType {
  provider: ethers.BrowserProvider | null;
  signer: any | null;
  contract: ethers.Contract | null;
}

interface StudentDetails {
  id: number;
  name: string;
  subjects: string[];
  marks: number[];
  isPassed?: boolean;
}

const contractAddress = ContractAddress.NestedMapping;
const contractABI = abi.abi;
// const HARDHAT_NETWORK_ID = "31337";
const SEPOLIA_NETWORK_ID = "11155111";

export default function Home() {
  const [state, setState] = useState<StateType>({
    provider: null,
    signer: null,
    contract: null,
  });
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [totalStudents, setTotalStudents] = useState<string>("0");
  const [loading, setLoading] = useState(false);

  // Form states
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [subject, setSubject] = useState("Math");
  const [marks, setMarks] = useState("");
  const [isPassed, setIsPassed] = useState(false);

  // View states
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(
    null
  );
  const [viewStudentId, setViewStudentId] = useState("");
  const [viewStudentName, setViewStudentName] = useState("");

  useEffect(() => {
    const connectWallet = async () => {
      try {
        const { ethereum } = window;

        if (ethereum) {
          window.ethereum.on("chainChanged", () => {
            window.location.reload();
          });

          window.ethereum.on("accountsChanged", () => {
            window.location.reload();
          });

          const chainId = await ethereum.request({ method: "eth_chainId" });
          if (chainId !== `0x${parseInt(SEPOLIA_NETWORK_ID).toString(16)}`) {
            setUserAddress("Other Network");
            alert("Please switch to the Hardhat Network (Chain ID: 31337)");
            return;
          }

          const account = await ethereum.request({
            method: "eth_requestAccounts",
          });

          const provider = new ethers.BrowserProvider(ethereum);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
          );
          if (ethereum.networkVersion === SEPOLIA_NETWORK_ID) {
            console.log("Connected to Hardhat network");
          } else {
            console.log("Wrong network. Expected:", SEPOLIA_NETWORK_ID);
          }
          setUserAddress(account[0]);
          setState({ provider, signer, contract });
          console.log(account);
          // Check if user is owner
          // const owner = await contract._owner();
          setIsOwner(account[0]);

          // Load initial contract data
          await refreshContractData(contract);
        } else {
          alert("Please install metamask");
        }
      } catch (error) {
        console.log(error);
      }
    };
    connectWallet();
  }, []);

  const refreshContractData = async (contract: ethers.Contract) => {
    try {
      const total = await contract.getTotalStudents();
      setTotalStudents(total.toString());
    } catch (error) {
      console.error("Error loading contract data:", error);
    }
  };

  const insertStudentStatus = async () => {
    if (!userAddress) return alert("Please connect your wallet");
    if (userAddress === "Other Network")
      return alert("Please Switch to Sepolia Network");
    if (!isOwner) return alert("Only owner can insert student status");

    try {
      setLoading(true);
      const tx = await state.contract!.insertStudentStatus(
        studentId,
        studentName,
        isPassed
      );
      await tx.wait();
      await refreshContractData(state.contract!);
      alert("Student status updated successfully!");
    } catch (error) {
      console.error("Error inserting student status:", error);
      alert("Error inserting student status. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const insertStudentMarks = async () => {
    if (!userAddress) return alert("Please connect your wallet");
    if (userAddress === "Other Network")
      return alert("Please Switch to Hardhat Network");

    try {
      setLoading(true);
      const tx = await state.contract!.insertStudentMarks(
        studentId,
        subject,
        marks
      );
      await tx.wait();
      alert("Student marks updated successfully!");
    } catch (error) {
      console.error("Error inserting student marks:", error);
      alert("Error inserting student marks. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const viewStudentDetails = async () => {
    if (!state.contract) return;

    try {
      setLoading(true);
      const details = await state.contract.getStudentDetails(
        viewStudentId,
        viewStudentName
      );

      const status = await state.contract.getStudentPassStatus(
        viewStudentId,
        viewStudentName
      );

      setStudentDetails({
        id: Number(details[0]),
        name: details[1],
        subjects: details[2],
        marks: details[3].map(Number),
        isPassed: status,
      });
    } catch (error) {
      console.error("Error fetching student details:", error);
      alert("Error fetching student details. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl mx-4">
        <h1 className="text-2xl font-bold mb-6 text-black text-center">
          Student Management DApp
        </h1>

        <div className="text-black text-sm font-bold mb-6 text-center  break-all">
          Your Address: {userAddress || "Not Connected"}
          {isOwner && " (Owner)"}
        </div>

        <div className="bg-gray-50 p-4 rounded mb-6">
          <p className="text-sm text-gray-600 mb-1">Total Students</p>
          <p className="text-2xl font-bold text-black">{totalStudents}</p>
        </div>

        {isOwner && (
          <div className="text-black bg-gray-50 p-4 rounded mb-6">
            <h2 className=" text-lg font-bold mb-4">Insert Student Status</h2>
            <div className="space-y-4">
              <input
                type="number"
                placeholder="Student ID"
                className="w-full text-black p-2 border rounded font-b"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
              <input
                type="text"
                placeholder="Student Name"
                className="w-full p-2 border rounded"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={isPassed}
                  onChange={(e) => setIsPassed(e.target.checked)}
                />
                <label>Passed</label>
              </div>
              <button
                onClick={insertStudentStatus}
                disabled={loading}
                className={`w-full py-2 rounded text-white font-medium ${
                  loading ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {loading ? "Processing..." : "Update Student Status"}
              </button>
            </div>
          </div>
        )}

        <div className="text-black bg-gray-50 p-4 rounded mb-6">
          <h2 className="text-black text-lg font-bold mb-4">
            Insert Student Marks
          </h2>
          <div className=" space-y-4">
            <input
              type="number"
              placeholder="Student ID"
              className="w-full p-2 border rounded"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
            <select
              className="w-full p-2 border rounded"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="Math">Math</option>
              <option value="Science">Science</option>
              <option value="English">English</option>
            </select>
            <input
              type="number"
              placeholder="Marks (0-100)"
              className="w-full p-2 border rounded"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
            />
            <button
              onClick={insertStudentMarks}
              disabled={loading}
              className={`w-full py-2 rounded text-white font-medium ${
                loading ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {loading ? "Processing..." : "Update Student Marks"}
            </button>
          </div>
        </div>

        <div className="text-black bg-gray-50 p-4 rounded mb-6">
          <h2 className="text-lg font-bold mb-4">View Student Details</h2>
          <div className="space-y-4">
            <input
              type="number"
              placeholder="Student ID"
              className="w-full p-2 border rounded"
              value={viewStudentId}
              onChange={(e) => setViewStudentId(e.target.value)}
            />
            <input
              type="text"
              placeholder="Student Name"
              className="w-full p-2 border rounded"
              value={viewStudentName}
              onChange={(e) => setViewStudentName(e.target.value)}
            />
            <button
              onClick={viewStudentDetails}
              disabled={loading}
              className={`w-full py-2 rounded text-white font-medium ${
                loading ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {loading ? "Processing..." : "View Details"}
            </button>
          </div>

          {studentDetails && (
            <div className="mt-4 p-4 bg-white rounded">
              <h3 className="font-bold mb-2">Student Information</h3>
              <p>ID: {studentDetails.id}</p>
              <p>Name: {studentDetails.name}</p>
              <p>Status: {studentDetails.isPassed ? "Passed" : "Not Passed"}</p>
              <div className="mt-2">
                <h4 className="font-bold">Marks:</h4>
                {studentDetails.subjects.map((subject, index) => (
                  <p key={subject}>
                    {subject}: {studentDetails.marks[index]}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
