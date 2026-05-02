import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// --- የእርስዎ Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyD-PRoRFT0UkjH0xYjTDmSvHOM8wRKHhco",
  authDomain: "sk-app-6df68.firebaseapp.com",
  projectId: "sk-app-6df68",
  storageBucket: "sk-app-6df68.firebasestorage.app",
  messagingSenderId: "1026792805000",
  appId: "1:1026792805000:web:ed93145cca49265f1a453d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const App = () => {
  const [activeTab, setActiveTab] = useState("🛍️ ሱቅ");
  const [products, setProducts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false); // ለእርስዎ እውነተኛ አድሚንነት

  // 1. ምርቶችን ከዳታቤዝ ለማንበብ
  useEffect(() => {
    const q = query(collection(db, "products"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // 2. ፎቶ ለመጫን (Upload Function)
  const handleFileUpload = async (file, folder) => {
    const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  // 3. አዲስ ምርት ለመጨመር (ለአድሚን)
  const addProduct = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const price = e.target.price.value;
    const file = e.target.image.files[0];
    
    const imageUrl = await handleFileUpload(file, "products");
    await addDoc(collection(db, "products"), { name, price, imageUrl, createdAt: new Date() });
    alert("ምርት በትክክል ተጭኗል!");
  };

  // --- Styles (ዲዛይን) ---
  const styles = {
    container: { background: '#0a0a0a', color: '#dfb06a', minHeight: '100vh', fontFamily: 'Arial' },
    header: { padding: '20px', textAlign: 'center', borderBottom: '1px solid #4a3a0a' },
    nav: { display: 'flex', justifyContent: 'space-around', padding: '10px', background: '#1a1a0a' },
    card: { background: '#1a1a0a', border: '1px solid #4a3a0a', borderRadius: '10px', margin: '15px', padding: '10px' },
    btn: { background: '#dfb06a', color: '#000', padding: '10px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>SK APP</h1>
        <p>ጥራትና ታማኝነት</p>
      </div>

      <div style={styles.nav}>
        {["🛍️ ሱቅ", "✈️ ተመላላሽ", "💬 ቻት", "⚙️ Admin"].map(tab => (
          <div key={tab} onClick={() => setActiveTab(tab)} style={{ cursor: 'pointer', fontWeight: activeTab === tab ? 'bold' : 'normal' }}>
            {tab}
          </div>
        ))}
      </div>

      {/* ሱቅ ገጽ */}
      {activeTab === "🛍️ ሱቅ" && (
        <div style={{ padding: '10px' }}>
          {products.map(p => (
            <div key={p.id} style={styles.card}>
              <img src={p.imageUrl} alt={p.name} style={{ width: '100%', borderRadius: '5px' }} />
              <h3>{p.name}</h3>
              <p>ዋጋ: {p.price} ብር</p>
              <button style={styles.btn}>አሁን እዘዝ</button>
            </div>
          ))}
        </div>
      )}

      {/* ቻት ገጽ */}
      {activeTab === "💬 ቻት" && (
        <div style={{ padding: '20px' }}>
          <h3>መልዕክት መለዋወጫ</h3>
          <div style={{ height: '300px', border: '1px solid #4a3a0a', marginBottom: '10px', padding: '10px', overflowY: 'scroll' }}>
            {/* መልዕክቶች እዚህ ይዘረዘራሉ */}
          </div>
          <input type="text" placeholder="መልዕክት ይጻፉ..." style={{ width: '80%', padding: '10px' }} />
          <button style={styles.btn}>ላክ</button>
        </div>
      )}

      {/* Admin ገጽ */}
      {activeTab === "⚙️ Admin" && (
        <div style={{ padding: '20px' }}>
          <h3>አዲስ ምርት መጫኛ</h3>
          <form onSubmit={addProduct}>
            <input name="name" placeholder="የምርት ስም" required style={{ display: 'block', margin: '10px 0', width: '100%' }} />
            <input name="price" placeholder="ዋጋ" required style={{ display: 'block', margin: '10px 0', width: '100%' }} />
            <input type="file" name="image" required style={{ display: 'block', margin: '10px 0' }} />
            <button type="submit" style={styles.btn}>ምርት ጫን</button>
          </form>
          <hr style={{ borderColor: '#4a3a0a', margin: '20px 0' }} />
          <h3>የሽያጭ ክትትል (Payment Tracking)</h3>
          <p>ጠቅላላ ሽያጭ: 0.00 ብር</p>
        </div>
      )}
    </div>
  );
};

export default App;
