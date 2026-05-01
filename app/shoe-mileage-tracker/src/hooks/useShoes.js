import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

export function useShoes(user) {
  const [shoes, setShoes] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  const shoesCollection = collection(db, "shoes");

  useEffect(() => {
    if (!user) return;

    async function fetchShoes() {
      try {
        const snapshot = await getDocs(shoesCollection);
        const shoesData = snapshot.docs.map((docSnap) => ({
          ...docSnap.data(),
          id: docSnap.id,
        }));
        setShoes(shoesData);
      } catch (err) {
        console.error("Error fetching shoes:", err);
        setError("Failed to fetch shoes from Firestore. See console for details.");
      } finally {
        setLoaded(true);
      }
    }

    fetchShoes();
  }, [user]);

  async function updateShoe(shoeId, shoeIndex, updatedFields) {
    const shoeDoc = doc(db, "shoes", shoeId);
    try {
      await updateDoc(shoeDoc, updatedFields);
      setShoes((prev) =>
        prev.map((s, idx) => (idx === shoeIndex ? { ...s, ...updatedFields } : s))
      );
      return true;
    } catch (err) {
      console.error("Error updating shoe:", err);
      setError("Failed to update shoe. See console for details.");
      return false;
    }
  }

  async function addShoe(shoeData) {
    try {
      const docRef = await addDoc(shoesCollection, shoeData);
      setShoes((prev) => [...prev, { ...shoeData, id: docRef.id }]);
      return true;
    } catch (err) {
      console.error("Error adding shoe:", err);
      setError("Failed to add shoe. See console for details.");
      return false;
    }
  }

  async function deleteShoe(shoeIndex) {
    const shoe = shoes[shoeIndex];
    try {
      if (shoe.id) await deleteDoc(doc(db, "shoes", shoe.id));
      setShoes((prev) => prev.filter((_, idx) => idx !== shoeIndex));
      return true;
    } catch (err) {
      console.error("Error deleting shoe:", err);
      setError("Failed to delete. See console for details.");
      return false;
    }
  }

  async function addRun(shoeIndex, runData) {
    const shoe = shoes[shoeIndex];
    const updatedLogs = [...(shoe.logs || []), runData];
    return updateShoe(shoe.id, shoeIndex, {
      miles: shoe.miles + runData.miles,
      logs: updatedLogs,
    });
  }

  async function editRun(shoeIndex, logIndex, runData) {
    const shoe = shoes[shoeIndex];
    const oldMiles = shoe.logs[logIndex].miles;
    const updatedLogs = shoe.logs.map((log, idx) =>
      idx === logIndex ? { ...log, ...runData } : log
    );
    return updateShoe(shoe.id, shoeIndex, {
      miles: shoe.miles - oldMiles + runData.miles,
      logs: updatedLogs,
    });
  }

  async function deleteRun(shoeIndex, logIndex) {
    const shoe = shoes[shoeIndex];
    const removedMiles = shoe.logs[logIndex].miles;
    const updatedLogs = shoe.logs.filter((_, idx) => idx !== logIndex);
    return updateShoe(shoe.id, shoeIndex, {
      miles: shoe.miles - removedMiles,
      logs: updatedLogs,
    });
  }

  return {
    shoes,
    loaded,
    error,
    clearError: () => setError(null),
    addShoe,
    deleteShoe,
    addRun,
    editRun,
    deleteRun,
  };
}
