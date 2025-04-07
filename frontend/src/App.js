import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaGoogle, FaInstagram, FaFacebook, FaApple, FaPinterest, FaTwitter, FaSnapchat, FaGithub, FaAmazon, FaCreditCard, FaTag } from 'react-icons/fa';
import './App.css';

const App = () => {
  const [vaults, setVaults] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false); // 控制表单显示
  const [newVault, setNewVault] = useState({
    name: '',
    username: '',
    password: '',
    owner: '',
    tags: [],
  });

  useEffect(() => {
    // Fetch vaults from the backend
    axios.get('https://cloudpass-backend.xx1284080.workers.dev/api/vaults', {
      headers: {
        Authorization: `Basic ${btoa('admin:admin')}`
      }
    })
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'tags') {
      setNewVault({ ...newVault, tags: value.split(',').map(tag => tag.trim()) });
    } else {
      setNewVault({ ...newVault, [name]: value });
    }
  };

  const handleAddVault = () => {
    axios.post('https://cloudpass-backend.xx1284080.workers.dev/api/vaults', newVault, {
      headers: {
        Authorization: `Basic ${btoa('admin:admin')}`
      }
    })
      .then(() => {
        // 重新获取 vaults
        axios.get('https://cloudpass-backend.xx1284080.workers.dev/api/vaults', {
          headers: {
            Authorization: `Basic ${btoa('admin:admin')}`
          }
        })
          .then(response => {
            setVaults(response.data);
            setShowForm(false);
            setNewVault({ name: '', username: '', password: '', owner: '', tags: [] });
          });
      })
      .catch(error => console.error('Error adding vault:', error));
  };

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
          <button className="new-btn" onClick={() => setShowForm(true)}>New</button>
          {showForm && (
            <div className="form">
              <h4>Add New Vault</h4>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={newVault.name}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={newVault.username}
                onChange={handleInputChange}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={newVault.password}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="owner"
                placeholder="Owner"
                value={newVault.owner}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="tags"
                placeholder="Tags (comma separated)"
                value={newVault.tags.join(', ')}
                onChange={handleInputChange}
              />
              <button onClick={handleAddVault}>Add</button>
              <button onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          )}
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
