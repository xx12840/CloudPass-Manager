import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaGoogle, FaInstagram, FaFacebook, FaApple, FaPinterest, FaTwitter, FaSnapchat, FaGithub, FaAmazon, FaCreditCard, FaTag } from 'react-icons/fa';
import './App.css';

const App = () => {
  const [vaults, setVaults] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Fetch vaults from the backend (Cloudflare Workers API)
    axios.get('https://your-worker.workers.dev/api/vaults')
      .then(response => setVaults(response.data))
      .catch(error => console.error('Error fetching vaults:', error));
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(`Copied: ${text}`);
  };

  const iconMap = {
    Gmail: <FaGoogle />,
    Instagram: <FaInstagram />,
    Facebook: <FaFacebook />,
    AppleID: <FaApple />,
    Pinterest: <FaPinterest />,
    Twitter: <FaTwitter />,
    Snapchat: <FaSnapchat />,
    Github: <FaGithub />,
    AWS: <FaAmazon />,
    'Company card': <FaCreditCard />,
  };

  const filteredVaults = vaults.filter(vault => {
    const matchesFilter = filter === 'ALL' || vault.owner === filter;
    const matchesSearch = vault.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="app">
      <div className="sidebar">
        <h2>Password Manager</h2>
        <div className="section">
          <h3>VAULT</h3>
          <ul>
            <li onClick={() => setFilter('ALL')}>ALL vaults</li>
            <li onClick={() => setFilter('Me')}>My vault</li>
            <li onClick={() => setFilter('Acme')}>Acme</li>
          </ul>
        </div>
        <div className="section">
          <h3>ALL ITEMS</h3>
          <ul>
            <li>Favorites</li>
            <li>Login</li>
            <li>Card</li>
            <li>Identity</li>
            <li>Note</li>
          </ul>
        </div>
        <div className="section">
          <h3>Folders</h3>
          <ul>
            <li>Finances</li>
            <li>Health</li>
            <li>Entertainment</li>
          </ul>
        </div>
      </div>
      <div className="main">
        <div className="filters">
          <h3>FILTERS</h3>
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="ALL">ALL vaults</option>
            <option value="Me">My vault</option>
            <option value="Acme">Acme</option>
          </select>
        </div>
        <div className="vault-list">
          <h3>ALL vaults</h3>
          <button className="new-btn">New</button>
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Owner</th>
                <th>Tags</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVaults.map((vault, index) => (
                <tr key={index}>
                  <td>{iconMap[vault.name] || <FaTag />}</td>
                  <td>{vault.name} <br /> {vault.username}</td>
                  <td>{vault.owner}</td>
                  <td>{vault.tags.join(', ')}</td>
                  <td>
                    <button onClick={() => copyToClipboard(vault.username)}>Copy Username</button>
                    <button onClick={() => copyToClipboard(vault.password)}>Copy Password</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default App;
