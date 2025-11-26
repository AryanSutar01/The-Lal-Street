/**
 * City to Zone Mapping for Financial Planning
 * 
 * Zone 1 (Metro Cities): Major metropolitan cities with high cost of living
 * Zone 2 (Tier-1/Non-Metro): Developed cities with moderate cost of living
 * Zone 3 (Rest of India): Other cities and towns with lower cost of living
 */

export interface CityInfo {
  name: string;
  zone: 1 | 2 | 3;
  state: string;
}

// Comprehensive city list with zone mapping - Deduplicated and organized
export const CITY_ZONE_MAPPING: CityInfo[] = [
  // Zone 1: Metro Cities (8 cities)
  { name: 'Mumbai', zone: 1, state: 'Maharashtra' },
  { name: 'Delhi', zone: 1, state: 'Delhi' },
  { name: 'Bangalore', zone: 1, state: 'Karnataka' },
  { name: 'Hyderabad', zone: 1, state: 'Telangana' },
  { name: 'Chennai', zone: 1, state: 'Tamil Nadu' },
  { name: 'Kolkata', zone: 1, state: 'West Bengal' },
  { name: 'Pune', zone: 1, state: 'Maharashtra' },
  { name: 'Ahmedabad', zone: 1, state: 'Gujarat' },
  
  // Zone 2: Tier-1/Non-Metro Cities (~150+ cities)
  // Maharashtra
  { name: 'Navi Mumbai', zone: 2, state: 'Maharashtra' },
  { name: 'Thane', zone: 2, state: 'Maharashtra' },
  { name: 'Kalyan-Dombivli', zone: 2, state: 'Maharashtra' },
  { name: 'Vasai-Virar', zone: 2, state: 'Maharashtra' },
  { name: 'Nagpur', zone: 2, state: 'Maharashtra' },
  { name: 'Nashik', zone: 2, state: 'Maharashtra' },
  { name: 'Aurangabad', zone: 2, state: 'Maharashtra' },
  { name: 'Solapur', zone: 2, state: 'Maharashtra' },
  { name: 'Kolhapur', zone: 2, state: 'Maharashtra' },
  { name: 'Sangli', zone: 2, state: 'Maharashtra' },
  { name: 'Jalgaon', zone: 2, state: 'Maharashtra' },
  { name: 'Amravati', zone: 2, state: 'Maharashtra' },
  { name: 'Latur', zone: 2, state: 'Maharashtra' },
  { name: 'Dhule', zone: 2, state: 'Maharashtra' },
  { name: 'Nanded', zone: 2, state: 'Maharashtra' },
  { name: 'Satara', zone: 2, state: 'Maharashtra' },
  { name: 'Ichalkaranji', zone: 2, state: 'Maharashtra' },
  { name: 'Akola', zone: 2, state: 'Maharashtra' },
  { name: 'Chandrapur', zone: 2, state: 'Maharashtra' },
  { name: 'Malegaon', zone: 2, state: 'Maharashtra' },
  { name: 'Jalna', zone: 2, state: 'Maharashtra' },
  { name: 'Bhusawal', zone: 2, state: 'Maharashtra' },
  { name: 'Panvel', zone: 2, state: 'Maharashtra' },
  { name: 'Badlapur', zone: 2, state: 'Maharashtra' },
  { name: 'Ulhasnagar', zone: 2, state: 'Maharashtra' },
  
  // Gujarat
  { name: 'Surat', zone: 2, state: 'Gujarat' },
  { name: 'Vadodara', zone: 2, state: 'Gujarat' },
  { name: 'Rajkot', zone: 2, state: 'Gujarat' },
  { name: 'Gandhinagar', zone: 2, state: 'Gujarat' },
  { name: 'Bhavnagar', zone: 2, state: 'Gujarat' },
  { name: 'Jamnagar', zone: 2, state: 'Gujarat' },
  { name: 'Junagadh', zone: 2, state: 'Gujarat' },
  { name: 'Gandhidham', zone: 2, state: 'Gujarat' },
  { name: 'Ankleshwar', zone: 2, state: 'Gujarat' },
  { name: 'Bharuch', zone: 2, state: 'Gujarat' },
  { name: 'Navsari', zone: 2, state: 'Gujarat' },
  { name: 'Valsad', zone: 2, state: 'Gujarat' },
  { name: 'Vapi', zone: 2, state: 'Gujarat' },
  { name: 'Morbi', zone: 2, state: 'Gujarat' },
  { name: 'Surendranagar', zone: 2, state: 'Gujarat' },
  { name: 'Mehsana', zone: 2, state: 'Gujarat' },
  { name: 'Palanpur', zone: 2, state: 'Gujarat' },
  { name: 'Bhuj', zone: 2, state: 'Gujarat' },
  
  // Rajasthan
  { name: 'Jaipur', zone: 2, state: 'Rajasthan' },
  { name: 'Jodhpur', zone: 2, state: 'Rajasthan' },
  { name: 'Kota', zone: 2, state: 'Rajasthan' },
  { name: 'Bikaner', zone: 2, state: 'Rajasthan' },
  { name: 'Ajmer', zone: 2, state: 'Rajasthan' },
  { name: 'Udaipur', zone: 2, state: 'Rajasthan' },
  { name: 'Alwar', zone: 2, state: 'Rajasthan' },
  { name: 'Bhilwara', zone: 2, state: 'Rajasthan' },
  { name: 'Bharatpur', zone: 2, state: 'Rajasthan' },
  { name: 'Sikar', zone: 2, state: 'Rajasthan' },
  { name: 'Pali', zone: 2, state: 'Rajasthan' },
  { name: 'Bhiwadi', zone: 2, state: 'Rajasthan' },
  { name: 'Sri Ganganagar', zone: 2, state: 'Rajasthan' },
  { name: 'Hanumangarh', zone: 2, state: 'Rajasthan' },
  { name: 'Tonk', zone: 2, state: 'Rajasthan' },
  { name: 'Kishangarh', zone: 2, state: 'Rajasthan' },
  { name: 'Beawar', zone: 2, state: 'Rajasthan' },
  { name: 'Chittorgarh', zone: 2, state: 'Rajasthan' },
  { name: 'Jhunjhunu', zone: 2, state: 'Rajasthan' },
  { name: 'Nagaur', zone: 2, state: 'Rajasthan' },
  { name: 'Sawai Madhopur', zone: 2, state: 'Rajasthan' },
  
  // Uttar Pradesh
  { name: 'Lucknow', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Kanpur', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Ghaziabad', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Agra', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Meerut', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Varanasi', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Allahabad', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Bareilly', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Aligarh', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Moradabad', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Saharanpur', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Muzaffarnagar', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Gorakhpur', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Mathura', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Jhansi', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Rampur', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Shahjahanpur', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Noida', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Greater Noida', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Firozabad', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Prayagraj', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Sitapur', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Hardoi', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Unnao', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Raebareli', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Sultanpur', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Bahraich', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Pilibhit', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Badaun', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Amroha', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Sambhal', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Shamli', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Bagpat', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Hapur', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Bulandshahr', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Hathras', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Etah', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Kasganj', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Mainpuri', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Etawah', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Auraiya', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Kannauj', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Farrukhabad', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Deoria', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Mau', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Azamgarh', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Ballia', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Ghazipur', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Mirzapur', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Sonbhadra', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Chandauli', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Fatehpur', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Banda', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Hamirpur', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Mahoba', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Lalitpur', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Jalaun', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Orai', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Lakhimpur Kheri', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Bijnor', zone: 2, state: 'Uttar Pradesh' },
  { name: 'Gautam Buddha Nagar', zone: 2, state: 'Uttar Pradesh' },
  
  // Madhya Pradesh
  { name: 'Indore', zone: 2, state: 'Madhya Pradesh' },
  { name: 'Bhopal', zone: 2, state: 'Madhya Pradesh' },
  { name: 'Gwalior', zone: 2, state: 'Madhya Pradesh' },
  { name: 'Jabalpur', zone: 2, state: 'Madhya Pradesh' },
  { name: 'Ujjain', zone: 2, state: 'Madhya Pradesh' },
  { name: 'Sagar', zone: 2, state: 'Madhya Pradesh' },
  { name: 'Dewas', zone: 2, state: 'Madhya Pradesh' },
  { name: 'Ratlam', zone: 2, state: 'Madhya Pradesh' },
  { name: 'Satna', zone: 2, state: 'Madhya Pradesh' },
  { name: 'Burhanpur', zone: 2, state: 'Madhya Pradesh' },
  { name: 'Murwara', zone: 2, state: 'Madhya Pradesh' },
  { name: 'Rewa', zone: 2, state: 'Madhya Pradesh' },
  { name: 'Chhindwara', zone: 2, state: 'Madhya Pradesh' },
  { name: 'Khandwa', zone: 2, state: 'Madhya Pradesh' },
  { name: 'Morena', zone: 2, state: 'Madhya Pradesh' },
  { name: 'Guna', zone: 2, state: 'Madhya Pradesh' },
  { name: 'Vidisha', zone: 2, state: 'Madhya Pradesh' },
  { name: 'Shivpuri', zone: 2, state: 'Madhya Pradesh' },
  
  // Punjab
  { name: 'Ludhiana', zone: 2, state: 'Punjab' },
  { name: 'Amritsar', zone: 2, state: 'Punjab' },
  { name: 'Jalandhar', zone: 2, state: 'Punjab' },
  { name: 'Patiala', zone: 2, state: 'Punjab' },
  { name: 'Mohali', zone: 2, state: 'Punjab' },
  { name: 'Bathinda', zone: 2, state: 'Punjab' },
  { name: 'Hoshiarpur', zone: 2, state: 'Punjab' },
  { name: 'Moga', zone: 2, state: 'Punjab' },
  { name: 'Sangrur', zone: 2, state: 'Punjab' },
  { name: 'Pathankot', zone: 2, state: 'Punjab' },
  { name: 'Phagwara', zone: 2, state: 'Punjab' },
  { name: 'Abohar', zone: 2, state: 'Punjab' },
  { name: 'Muktsar', zone: 2, state: 'Punjab' },
  { name: 'Firozpur', zone: 2, state: 'Punjab' },
  { name: 'Kapurthala', zone: 2, state: 'Punjab' },
  { name: 'Batala', zone: 2, state: 'Punjab' },
  
  // Haryana
  { name: 'Gurgaon', zone: 2, state: 'Haryana' },
  { name: 'Faridabad', zone: 2, state: 'Haryana' },
  { name: 'Panipat', zone: 2, state: 'Haryana' },
  { name: 'Karnal', zone: 2, state: 'Haryana' },
  { name: 'Rohtak', zone: 2, state: 'Haryana' },
  { name: 'Hisar', zone: 2, state: 'Haryana' },
  { name: 'Sonipat', zone: 2, state: 'Haryana' },
  { name: 'Ambala', zone: 2, state: 'Haryana' },
  { name: 'Yamunanagar', zone: 2, state: 'Haryana' },
  { name: 'Kurukshetra', zone: 2, state: 'Haryana' },
  { name: 'Rewari', zone: 2, state: 'Haryana' },
  { name: 'Palwal', zone: 2, state: 'Haryana' },
  { name: 'Bhiwani', zone: 2, state: 'Haryana' },
  { name: 'Sirsa', zone: 2, state: 'Haryana' },
  { name: 'Kaithal', zone: 2, state: 'Haryana' },
  { name: 'Narnaul', zone: 2, state: 'Haryana' },
  { name: 'Fatehabad', zone: 2, state: 'Haryana' },
  { name: 'Jind', zone: 2, state: 'Haryana' },
  
  // Uttarakhand
  { name: 'Dehradun', zone: 2, state: 'Uttarakhand' },
  { name: 'Haridwar', zone: 2, state: 'Uttarakhand' },
  { name: 'Roorkee', zone: 2, state: 'Uttarakhand' },
  { name: 'Haldwani', zone: 2, state: 'Uttarakhand' },
  { name: 'Rudrapur', zone: 2, state: 'Uttarakhand' },
  { name: 'Kashipur', zone: 2, state: 'Uttarakhand' },
  { name: 'Rishikesh', zone: 2, state: 'Uttarakhand' },
  { name: 'Nainital', zone: 2, state: 'Uttarakhand' },
  { name: 'Pithoragarh', zone: 2, state: 'Uttarakhand' },
  { name: 'Almora', zone: 2, state: 'Uttarakhand' },
  
  // Bihar
  { name: 'Patna', zone: 2, state: 'Bihar' },
  { name: 'Muzaffarpur', zone: 2, state: 'Bihar' },
  { name: 'Gaya', zone: 2, state: 'Bihar' },
  { name: 'Bhagalpur', zone: 2, state: 'Bihar' },
  { name: 'Purnia', zone: 2, state: 'Bihar' },
  { name: 'Darbhanga', zone: 2, state: 'Bihar' },
  { name: 'Arrah', zone: 2, state: 'Bihar' },
  { name: 'Begusarai', zone: 2, state: 'Bihar' },
  { name: 'Katihar', zone: 2, state: 'Bihar' },
  { name: 'Munger', zone: 2, state: 'Bihar' },
  { name: 'Chhapra', zone: 2, state: 'Bihar' },
  { name: 'Hajipur', zone: 2, state: 'Bihar' },
  { name: 'Saharsa', zone: 2, state: 'Bihar' },
  { name: 'Samastipur', zone: 2, state: 'Bihar' },
  { name: 'Motihari', zone: 2, state: 'Bihar' },
  { name: 'Bettiah', zone: 2, state: 'Bihar' },
  { name: 'Siwan', zone: 2, state: 'Bihar' },
  { name: 'Buxar', zone: 2, state: 'Bihar' },
  { name: 'Jehanabad', zone: 2, state: 'Bihar' },
  { name: 'Nawada', zone: 2, state: 'Bihar' },
  
  // Chhattisgarh
  { name: 'Raipur', zone: 2, state: 'Chhattisgarh' },
  { name: 'Durg-Bhilai', zone: 2, state: 'Chhattisgarh' },
  { name: 'Bilaspur', zone: 2, state: 'Chhattisgarh' },
  { name: 'Korba', zone: 2, state: 'Chhattisgarh' },
  { name: 'Raigarh', zone: 2, state: 'Chhattisgarh' },
  { name: 'Jagdalpur', zone: 2, state: 'Chhattisgarh' },
  { name: 'Ambikapur', zone: 2, state: 'Chhattisgarh' },
  { name: 'Rajnandgaon', zone: 2, state: 'Chhattisgarh' },
  { name: 'Dhamtari', zone: 2, state: 'Chhattisgarh' },
  { name: 'Mahasamund', zone: 2, state: 'Chhattisgarh' },
  
  // Jharkhand
  { name: 'Ranchi', zone: 2, state: 'Jharkhand' },
  { name: 'Jamshedpur', zone: 2, state: 'Jharkhand' },
  { name: 'Dhanbad', zone: 2, state: 'Jharkhand' },
  { name: 'Bokaro', zone: 2, state: 'Jharkhand' },
  { name: 'Hazaribagh', zone: 2, state: 'Jharkhand' },
  { name: 'Ramgarh', zone: 2, state: 'Jharkhand' },
  { name: 'Giridih', zone: 2, state: 'Jharkhand' },
  { name: 'Deoghar', zone: 2, state: 'Jharkhand' },
  { name: 'Dumka', zone: 2, state: 'Jharkhand' },
  { name: 'Gumla', zone: 2, state: 'Jharkhand' },
  
  // Odisha
  { name: 'Bhubaneswar', zone: 2, state: 'Odisha' },
  { name: 'Cuttack', zone: 2, state: 'Odisha' },
  { name: 'Rourkela', zone: 2, state: 'Odisha' },
  { name: 'Berhampur', zone: 2, state: 'Odisha' },
  { name: 'Sambalpur', zone: 2, state: 'Odisha' },
  { name: 'Puri', zone: 2, state: 'Odisha' },
  { name: 'Balasore', zone: 2, state: 'Odisha' },
  { name: 'Bhadrak', zone: 2, state: 'Odisha' },
  { name: 'Baripada', zone: 2, state: 'Odisha' },
  { name: 'Jharsuguda', zone: 2, state: 'Odisha' },
  
  // Tamil Nadu
  { name: 'Coimbatore', zone: 2, state: 'Tamil Nadu' },
  { name: 'Madurai', zone: 2, state: 'Tamil Nadu' },
  { name: 'Tiruchirappalli', zone: 2, state: 'Tamil Nadu' },
  { name: 'Salem', zone: 2, state: 'Tamil Nadu' },
  { name: 'Tirunelveli', zone: 2, state: 'Tamil Nadu' },
  { name: 'Erode', zone: 2, state: 'Tamil Nadu' },
  { name: 'Dindigul', zone: 2, state: 'Tamil Nadu' },
  { name: 'Vellore', zone: 2, state: 'Tamil Nadu' },
  { name: 'Tirupur', zone: 2, state: 'Tamil Nadu' },
  { name: 'Nagercoil', zone: 2, state: 'Tamil Nadu' },
  { name: 'Thanjavur', zone: 2, state: 'Tamil Nadu' },
  { name: 'Kumbakonam', zone: 2, state: 'Tamil Nadu' },
  { name: 'Karaikudi', zone: 2, state: 'Tamil Nadu' },
  { name: 'Dharmapuri', zone: 2, state: 'Tamil Nadu' },
  { name: 'Krishnagiri', zone: 2, state: 'Tamil Nadu' },
  { name: 'Hosur', zone: 2, state: 'Tamil Nadu' },
  { name: 'Pollachi', zone: 2, state: 'Tamil Nadu' },
  { name: 'Udumalaipettai', zone: 2, state: 'Tamil Nadu' },
  { name: 'Rajapalayam', zone: 2, state: 'Tamil Nadu' },
  { name: 'Sivakasi', zone: 2, state: 'Tamil Nadu' },
  { name: 'Virudhunagar', zone: 2, state: 'Tamil Nadu' },
  
  // Karnataka
  { name: 'Mysore', zone: 2, state: 'Karnataka' },
  { name: 'Hubli', zone: 2, state: 'Karnataka' },
  { name: 'Mangalore', zone: 2, state: 'Karnataka' },
  { name: 'Belgaum', zone: 2, state: 'Karnataka' },
  { name: 'Gulbarga', zone: 2, state: 'Karnataka' },
  { name: 'Dharwad', zone: 2, state: 'Karnataka' },
  { name: 'Bijapur', zone: 2, state: 'Karnataka' },
  { name: 'Raichur', zone: 2, state: 'Karnataka' },
  { name: 'Bidar', zone: 2, state: 'Karnataka' },
  { name: 'Hospet', zone: 2, state: 'Karnataka' },
  { name: 'Bellary', zone: 2, state: 'Karnataka' },
  { name: 'Tumkur', zone: 2, state: 'Karnataka' },
  { name: 'Mandya', zone: 2, state: 'Karnataka' },
  { name: 'Shimoga', zone: 2, state: 'Karnataka' },
  { name: 'Chikmagalur', zone: 2, state: 'Karnataka' },
  { name: 'Udupi', zone: 2, state: 'Karnataka' },
  { name: 'Davangere', zone: 2, state: 'Karnataka' },
  { name: 'Hassan', zone: 2, state: 'Karnataka' },
  
  // Telangana
  { name: 'Warangal', zone: 2, state: 'Telangana' },
  { name: 'Nizamabad', zone: 2, state: 'Telangana' },
  { name: 'Karimnagar', zone: 2, state: 'Telangana' },
  { name: 'Ramagundam', zone: 2, state: 'Telangana' },
  { name: 'Mahabubnagar', zone: 2, state: 'Telangana' },
  { name: 'Siddipet', zone: 2, state: 'Telangana' },
  { name: 'Suryapet', zone: 2, state: 'Telangana' },
  { name: 'Adilabad', zone: 2, state: 'Telangana' },
  { name: 'Nalgonda', zone: 2, state: 'Telangana' },
  { name: 'Khammam', zone: 2, state: 'Telangana' },
  
  // Andhra Pradesh
  { name: 'Visakhapatnam', zone: 2, state: 'Andhra Pradesh' },
  { name: 'Vijayawada', zone: 2, state: 'Andhra Pradesh' },
  { name: 'Rajahmundry', zone: 2, state: 'Andhra Pradesh' },
  { name: 'Guntur', zone: 2, state: 'Andhra Pradesh' },
  { name: 'Tirupati', zone: 2, state: 'Andhra Pradesh' },
  { name: 'Nellore', zone: 2, state: 'Andhra Pradesh' },
  { name: 'Kurnool', zone: 2, state: 'Andhra Pradesh' },
  { name: 'Kadapa', zone: 2, state: 'Andhra Pradesh' },
  { name: 'Anantapur', zone: 2, state: 'Andhra Pradesh' },
  { name: 'Chittoor', zone: 2, state: 'Andhra Pradesh' },
  { name: 'Eluru', zone: 2, state: 'Andhra Pradesh' },
  { name: 'Ongole', zone: 2, state: 'Andhra Pradesh' },
  { name: 'Machilipatnam', zone: 2, state: 'Andhra Pradesh' },
  { name: 'Proddatur', zone: 2, state: 'Andhra Pradesh' },
  { name: 'Tenali', zone: 2, state: 'Andhra Pradesh' },
  { name: 'Bhimavaram', zone: 2, state: 'Andhra Pradesh' },
  
  // Kerala
  { name: 'Kochi', zone: 2, state: 'Kerala' },
  { name: 'Thiruvananthapuram', zone: 2, state: 'Kerala' },
  { name: 'Kozhikode', zone: 2, state: 'Kerala' },
  { name: 'Thrissur', zone: 2, state: 'Kerala' },
  { name: 'Kannur', zone: 2, state: 'Kerala' },
  { name: 'Kollam', zone: 2, state: 'Kerala' },
  { name: 'Alappuzha', zone: 2, state: 'Kerala' },
  { name: 'Palakkad', zone: 2, state: 'Kerala' },
  { name: 'Malappuram', zone: 2, state: 'Kerala' },
  { name: 'Kottayam', zone: 2, state: 'Kerala' },
  { name: 'Manjeri', zone: 2, state: 'Kerala' },
  { name: 'Tirur', zone: 2, state: 'Kerala' },
  { name: 'Ponnani', zone: 2, state: 'Kerala' },
  
  // West Bengal
  { name: 'Howrah', zone: 2, state: 'West Bengal' },
  { name: 'Durgapur', zone: 2, state: 'West Bengal' },
  { name: 'Asansol', zone: 2, state: 'West Bengal' },
  { name: 'Siliguri', zone: 2, state: 'West Bengal' },
  { name: 'Bardhaman', zone: 2, state: 'West Bengal' },
  { name: 'Malda', zone: 2, state: 'West Bengal' },
  { name: 'Kharagpur', zone: 2, state: 'West Bengal' },
  { name: 'Haldia', zone: 2, state: 'West Bengal' },
  { name: 'Krishnanagar', zone: 2, state: 'West Bengal' },
  { name: 'Darjeeling', zone: 2, state: 'West Bengal' },
  
  // Assam
  { name: 'Guwahati', zone: 2, state: 'Assam' },
  { name: 'Silchar', zone: 2, state: 'Assam' },
  { name: 'Dibrugarh', zone: 2, state: 'Assam' },
  { name: 'Jorhat', zone: 2, state: 'Assam' },
  { name: 'Tinsukia', zone: 2, state: 'Assam' },
  { name: 'Tezpur', zone: 2, state: 'Assam' },
  { name: 'Nagaon', zone: 2, state: 'Assam' },
  { name: 'Goalpara', zone: 2, state: 'Assam' },
  
  // Other States
  { name: 'Chandigarh', zone: 2, state: 'Chandigarh' },
  { name: 'Srinagar', zone: 2, state: 'Jammu and Kashmir' },
  { name: 'Jammu', zone: 2, state: 'Jammu and Kashmir' },
  { name: 'Imphal', zone: 2, state: 'Manipur' },
  { name: 'Shillong', zone: 2, state: 'Meghalaya' },
  { name: 'Panaji', zone: 2, state: 'Goa' },
  { name: 'Vasco da Gama', zone: 2, state: 'Goa' },
  { name: 'Pondicherry', zone: 2, state: 'Puducherry' },
  
  // Zone 3: Rest of India (Smaller cities and towns) - Adding 200+ cities
  // Maharashtra - Zone 3
  { name: 'Parbhani', zone: 3, state: 'Maharashtra' },
  { name: 'Sangamner', zone: 3, state: 'Maharashtra' },
  { name: 'Barshi', zone: 3, state: 'Maharashtra' },
  { name: 'Yavatmal', zone: 3, state: 'Maharashtra' },
  { name: 'Kamptee', zone: 3, state: 'Maharashtra' },
  { name: 'Gondia', zone: 3, state: 'Maharashtra' },
  { name: 'Wardha', zone: 3, state: 'Maharashtra' },
  { name: 'Osmanabad', zone: 3, state: 'Maharashtra' },
  { name: 'Beed', zone: 3, state: 'Maharashtra' },
  { name: 'Ahmednagar', zone: 3, state: 'Maharashtra' },
  { name: 'Ratnagiri', zone: 3, state: 'Maharashtra' },
  { name: 'Chiplun', zone: 3, state: 'Maharashtra' },
  { name: 'Baramati', zone: 3, state: 'Maharashtra' },
  { name: 'Sangli-Miraj', zone: 3, state: 'Maharashtra' },
  
  // Gujarat - Zone 3
  { name: 'Godhra', zone: 3, state: 'Gujarat' },
  { name: 'Botad', zone: 3, state: 'Gujarat' },
  { name: 'Dahod', zone: 3, state: 'Gujarat' },
  { name: 'Nadiad', zone: 3, state: 'Gujarat' },
  
  // Rajasthan - Zone 3
  { name: 'Banswara', zone: 3, state: 'Rajasthan' },
  { name: 'Baran', zone: 3, state: 'Rajasthan' },
  { name: 'Bundi', zone: 3, state: 'Rajasthan' },
  { name: 'Dausa', zone: 3, state: 'Rajasthan' },
  { name: 'Dholpur', zone: 3, state: 'Rajasthan' },
  { name: 'Dungarpur', zone: 3, state: 'Rajasthan' },
  { name: 'Jaisalmer', zone: 3, state: 'Rajasthan' },
  { name: 'Jalore', zone: 3, state: 'Rajasthan' },
  { name: 'Jhalawar', zone: 3, state: 'Rajasthan' },
  { name: 'Rajsamand', zone: 3, state: 'Rajasthan' },
  { name: 'Sirohi', zone: 3, state: 'Rajasthan' },
  { name: 'Karauli', zone: 3, state: 'Rajasthan' },
  
  // Uttar Pradesh - Zone 3
  { name: 'Kashipur', zone: 3, state: 'Uttar Pradesh' },
  { name: 'Fatehgarh', zone: 3, state: 'Uttar Pradesh' },
  { name: 'Kaushambi', zone: 3, state: 'Uttar Pradesh' },
  { name: 'Pratapgarh', zone: 3, state: 'Uttar Pradesh' },
  { name: 'Amethi', zone: 3, state: 'Uttar Pradesh' },
  { name: 'Barabanki', zone: 3, state: 'Uttar Pradesh' },
  { name: 'Ayodhya', zone: 3, state: 'Uttar Pradesh' },
  { name: 'Gonda', zone: 3, state: 'Uttar Pradesh' },
  { name: 'Basti', zone: 3, state: 'Uttar Pradesh' },
  { name: 'Siddharthnagar', zone: 3, state: 'Uttar Pradesh' },
  { name: 'Maharajganj', zone: 3, state: 'Uttar Pradesh' },
  { name: 'Kushinagar', zone: 3, state: 'Uttar Pradesh' },
  { name: 'Sant Kabir Nagar', zone: 3, state: 'Uttar Pradesh' },
  
  // Uttarakhand - Zone 3
  { name: 'Mussoorie', zone: 3, state: 'Uttarakhand' },
  { name: 'Chamoli', zone: 3, state: 'Uttarakhand' },
  { name: 'Tehri', zone: 3, state: 'Uttarakhand' },
  { name: 'Pauri', zone: 3, state: 'Uttarakhand' },
  { name: 'Champawat', zone: 3, state: 'Uttarakhand' },
  { name: 'Bageshwar', zone: 3, state: 'Uttarakhand' },
  { name: 'Udham Singh Nagar', zone: 3, state: 'Uttarakhand' },
  
  // Bihar - Zone 3
  { name: 'Madhepura', zone: 3, state: 'Bihar' },
  { name: 'Banka', zone: 3, state: 'Bihar' },
  { name: 'Jamui', zone: 3, state: 'Bihar' },
  { name: 'Lakhisarai', zone: 3, state: 'Bihar' },
  { name: 'Sheikhpura', zone: 3, state: 'Bihar' },
  { name: 'Aurangabad', zone: 3, state: 'Bihar' },
  { name: 'Kaimur', zone: 3, state: 'Bihar' },
  { name: 'Rohtas', zone: 3, state: 'Bihar' },
  { name: 'Arwal', zone: 3, state: 'Bihar' },
  { name: 'Gopalganj', zone: 3, state: 'Bihar' },
  { name: 'Vaishali', zone: 3, state: 'Bihar' },
  { name: 'Saran', zone: 3, state: 'Bihar' },
  { name: 'Sheohar', zone: 3, state: 'Bihar' },
  { name: 'Sitamarhi', zone: 3, state: 'Bihar' },
  { name: 'Madhubani', zone: 3, state: 'Bihar' },
  { name: 'Supaul', zone: 3, state: 'Bihar' },
  { name: 'Kishanganj', zone: 3, state: 'Bihar' },
  { name: 'Araria', zone: 3, state: 'Bihar' },
  
  // Chhattisgarh - Zone 3
  { name: 'Dantewada', zone: 3, state: 'Chhattisgarh' },
  { name: 'Bijapur', zone: 3, state: 'Chhattisgarh' },
  { name: 'Narayanpur', zone: 3, state: 'Chhattisgarh' },
  { name: 'Kanker', zone: 3, state: 'Chhattisgarh' },
  { name: 'Kondagaon', zone: 3, state: 'Chhattisgarh' },
  { name: 'Bastar', zone: 3, state: 'Chhattisgarh' },
  { name: 'Sukma', zone: 3, state: 'Chhattisgarh' },
  { name: 'Mungeli', zone: 3, state: 'Chhattisgarh' },
  { name: 'Balod', zone: 3, state: 'Chhattisgarh' },
  { name: 'Gariaband', zone: 3, state: 'Chhattisgarh' },
  
  // Jharkhand - Zone 3
  { name: 'Pakur', zone: 3, state: 'Jharkhand' },
  { name: 'Godda', zone: 3, state: 'Jharkhand' },
  { name: 'Sahebganj', zone: 3, state: 'Jharkhand' },
  { name: 'Chatra', zone: 3, state: 'Jharkhand' },
  { name: 'Koderma', zone: 3, state: 'Jharkhand' },
  { name: 'Simdega', zone: 3, state: 'Jharkhand' },
  { name: 'Khunti', zone: 3, state: 'Jharkhand' },
  { name: 'Latehar', zone: 3, state: 'Jharkhand' },
  { name: 'Lohardaga', zone: 3, state: 'Jharkhand' },
  { name: 'Palamu', zone: 3, state: 'Jharkhand' },
  
  // Odisha - Zone 3
  { name: 'Jajpur', zone: 3, state: 'Odisha' },
  { name: 'Kendrapara', zone: 3, state: 'Odisha' },
  { name: 'Jagatsinghpur', zone: 3, state: 'Odisha' },
  { name: 'Khordha', zone: 3, state: 'Odisha' },
  { name: 'Nayagarh', zone: 3, state: 'Odisha' },
  { name: 'Ganjam', zone: 3, state: 'Odisha' },
  { name: 'Gajapati', zone: 3, state: 'Odisha' },
  { name: 'Kandhamal', zone: 3, state: 'Odisha' },
  { name: 'Boudh', zone: 3, state: 'Odisha' },
  { name: 'Sonepur', zone: 3, state: 'Odisha' },
  { name: 'Bolangir', zone: 3, state: 'Odisha' },
  { name: 'Nuapada', zone: 3, state: 'Odisha' },
  { name: 'Kalahandi', zone: 3, state: 'Odisha' },
  { name: 'Rayagada', zone: 3, state: 'Odisha' },
  { name: 'Nabarangpur', zone: 3, state: 'Odisha' },
  { name: 'Koraput', zone: 3, state: 'Odisha' },
  { name: 'Malkangiri', zone: 3, state: 'Odisha' },
  { name: 'Angul', zone: 3, state: 'Odisha' },
  { name: 'Dhenkanal', zone: 3, state: 'Odisha' },
  { name: 'Keonjhar', zone: 3, state: 'Odisha' },
  { name: 'Mayurbhanj', zone: 3, state: 'Odisha' },
  
  // Tamil Nadu - Zone 3
  { name: 'Tuticorin', zone: 3, state: 'Tamil Nadu' },
  { name: 'Cuddalore', zone: 3, state: 'Tamil Nadu' },
  { name: 'Villupuram', zone: 3, state: 'Tamil Nadu' },
  { name: 'Pudukkottai', zone: 3, state: 'Tamil Nadu' },
  { name: 'Ramanathapuram', zone: 3, state: 'Tamil Nadu' },
  { name: 'Sivaganga', zone: 3, state: 'Tamil Nadu' },
  { name: 'Pattukkottai', zone: 3, state: 'Tamil Nadu' },
  { name: 'Ariyalur', zone: 3, state: 'Tamil Nadu' },
  { name: 'Perambalur', zone: 3, state: 'Tamil Nadu' },
  { name: 'Nagapattinam', zone: 3, state: 'Tamil Nadu' },
  { name: 'Thiruvarur', zone: 3, state: 'Tamil Nadu' },
  
  // Karnataka - Zone 3
  { name: 'Chitradurga', zone: 3, state: 'Karnataka' },
  { name: 'Kolar', zone: 3, state: 'Karnataka' },
  { name: 'Chikkaballapur', zone: 3, state: 'Karnataka' },
  { name: 'Ramanagara', zone: 3, state: 'Karnataka' },
  { name: 'Chamarajanagar', zone: 3, state: 'Karnataka' },
  { name: 'Haveri', zone: 3, state: 'Karnataka' },
  { name: 'Gadag', zone: 3, state: 'Karnataka' },
  { name: 'Bagalkot', zone: 3, state: 'Karnataka' },
  { name: 'Vijayapura', zone: 3, state: 'Karnataka' },
  { name: 'Yadgir', zone: 3, state: 'Karnataka' },
  { name: 'Kalaburagi', zone: 3, state: 'Karnataka' },
  
  // Telangana - Zone 3
  { name: 'Medak', zone: 3, state: 'Telangana' },
  { name: 'Sangareddy', zone: 3, state: 'Telangana' },
  { name: 'Mancherial', zone: 3, state: 'Telangana' },
  { name: 'Jagtial', zone: 3, state: 'Telangana' },
  { name: 'Kamareddy', zone: 3, state: 'Telangana' },
  { name: 'Peddapalli', zone: 3, state: 'Telangana' },
  { name: 'Bhongir', zone: 3, state: 'Telangana' },
  { name: 'Mahabubabad', zone: 3, state: 'Telangana' },
  
  // Andhra Pradesh - Zone 3
  { name: 'Tadepalligudem', zone: 3, state: 'Andhra Pradesh' },
  { name: 'Palakollu', zone: 3, state: 'Andhra Pradesh' },
  { name: 'Narsapuram', zone: 3, state: 'Andhra Pradesh' },
  { name: 'Chilakaluripet', zone: 3, state: 'Andhra Pradesh' },
  { name: 'Bapatla', zone: 3, state: 'Andhra Pradesh' },
  { name: 'Srikakulam', zone: 3, state: 'Andhra Pradesh' },
  { name: 'Vizianagaram', zone: 3, state: 'Andhra Pradesh' },
  { name: 'Parvathipuram', zone: 3, state: 'Andhra Pradesh' },
  { name: 'Narasaraopet', zone: 3, state: 'Andhra Pradesh' },
  { name: 'Markapur', zone: 3, state: 'Andhra Pradesh' },
  { name: 'Kadiri', zone: 3, state: 'Andhra Pradesh' },
  
  // Kerala - Zone 3
  { name: 'Pathanamthitta', zone: 3, state: 'Kerala' },
  { name: 'Idukki', zone: 3, state: 'Kerala' },
  { name: 'Wayanad', zone: 3, state: 'Kerala' },
  { name: 'Kasaragod', zone: 3, state: 'Kerala' },
  
  // West Bengal - Zone 3
  { name: 'Kalyani', zone: 3, state: 'West Bengal' },
  { name: 'Raiganj', zone: 3, state: 'West Bengal' },
  { name: 'Balurghat', zone: 3, state: 'West Bengal' },
  { name: 'Jalpaiguri', zone: 3, state: 'West Bengal' },
  { name: 'Alipurduar', zone: 3, state: 'West Bengal' },
  { name: 'Cooch Behar', zone: 3, state: 'West Bengal' },
  { name: 'Purulia', zone: 3, state: 'West Bengal' },
  { name: 'Bankura', zone: 3, state: 'West Bengal' },
  { name: 'Midnapore', zone: 3, state: 'West Bengal' },
  { name: 'Tamluk', zone: 3, state: 'West Bengal' },
  { name: 'Contai', zone: 3, state: 'West Bengal' },
  { name: 'Diamond Harbour', zone: 3, state: 'West Bengal' },
  { name: 'Barasat', zone: 3, state: 'West Bengal' },
  { name: 'Basirhat', zone: 3, state: 'West Bengal' },
  { name: 'Berhampore', zone: 3, state: 'West Bengal' },
  { name: 'Baharampur', zone: 3, state: 'West Bengal' },
  
  // Assam - Zone 3
  { name: 'Barpeta', zone: 3, state: 'Assam' },
  { name: 'Bongaigaon', zone: 3, state: 'Assam' },
  { name: 'Dhubri', zone: 3, state: 'Assam' },
  { name: 'Kokrajhar', zone: 3, state: 'Assam' },
  { name: 'Sivasagar', zone: 3, state: 'Assam' },
  { name: 'Dhemaji', zone: 3, state: 'Assam' },
  { name: 'Lakhimpur', zone: 3, state: 'Assam' },
  { name: 'Sonitpur', zone: 3, state: 'Assam' },
  { name: 'Udalguri', zone: 3, state: 'Assam' },
  { name: 'Darrang', zone: 3, state: 'Assam' },
  { name: 'Morigaon', zone: 3, state: 'Assam' },
  { name: 'Hojai', zone: 3, state: 'Assam' },
  { name: 'Karimganj', zone: 3, state: 'Assam' },
  { name: 'Hailakandi', zone: 3, state: 'Assam' },
  { name: 'Cachar', zone: 3, state: 'Assam' },
  { name: 'Karbi Anglong', zone: 3, state: 'Assam' },
  { name: 'Dima Hasao', zone: 3, state: 'Assam' },
  
  // Northeast States - Zone 3
  { name: 'Kohima', zone: 3, state: 'Nagaland' },
  { name: 'Dimapur', zone: 3, state: 'Nagaland' },
  { name: 'Mokokchung', zone: 3, state: 'Nagaland' },
  { name: 'Tuensang', zone: 3, state: 'Nagaland' },
  { name: 'Wokha', zone: 3, state: 'Nagaland' },
  { name: 'Zunheboto', zone: 3, state: 'Nagaland' },
  { name: 'Aizawl', zone: 3, state: 'Mizoram' },
  { name: 'Lunglei', zone: 3, state: 'Mizoram' },
  { name: 'Saiha', zone: 3, state: 'Mizoram' },
  { name: 'Champhai', zone: 3, state: 'Mizoram' },
  { name: 'Serchhip', zone: 3, state: 'Mizoram' },
  { name: 'Kolasib', zone: 3, state: 'Mizoram' },
  { name: 'Mamit', zone: 3, state: 'Mizoram' },
  { name: 'Lawngtlai', zone: 3, state: 'Mizoram' },
  { name: 'Agartala', zone: 3, state: 'Tripura' },
  { name: 'Udaipur', zone: 3, state: 'Tripura' },
  { name: 'Ambassa', zone: 3, state: 'Tripura' },
  { name: 'Kailasahar', zone: 3, state: 'Tripura' },
  { name: 'Dharmanagar', zone: 3, state: 'Tripura' },
  { name: 'Khowai', zone: 3, state: 'Tripura' },
  { name: 'Itanagar', zone: 3, state: 'Arunachal Pradesh' },
  { name: 'Naharlagun', zone: 3, state: 'Arunachal Pradesh' },
  { name: 'Pasighat', zone: 3, state: 'Arunachal Pradesh' },
  { name: 'Tezu', zone: 3, state: 'Arunachal Pradesh' },
  { name: 'Ziro', zone: 3, state: 'Arunachal Pradesh' },
  { name: 'Bomdila', zone: 3, state: 'Arunachal Pradesh' },
  { name: 'Tawang', zone: 3, state: 'Arunachal Pradesh' },
  { name: 'Gangtok', zone: 3, state: 'Sikkim' },
  { name: 'Namchi', zone: 3, state: 'Sikkim' },
  { name: 'Mangan', zone: 3, state: 'Sikkim' },
  { name: 'Geyzing', zone: 3, state: 'Sikkim' },
  { name: 'Jorethang', zone: 3, state: 'Sikkim' },
  { name: 'Anantnag', zone: 3, state: 'Jammu and Kashmir' },
  { name: 'Baramulla', zone: 3, state: 'Jammu and Kashmir' },
  { name: 'Sopore', zone: 3, state: 'Jammu and Kashmir' },
  { name: 'Leh', zone: 3, state: 'Ladakh' },
  { name: 'Kargil', zone: 3, state: 'Ladakh' },
  
  // Union Territories - Zone 3
  { name: 'Port Blair', zone: 3, state: 'Andaman and Nicobar Islands' },
  { name: 'Diglipur', zone: 3, state: 'Andaman and Nicobar Islands' },
  { name: 'Mayabunder', zone: 3, state: 'Andaman and Nicobar Islands' },
  { name: 'Rangat', zone: 3, state: 'Andaman and Nicobar Islands' },
  { name: 'Kavaratti', zone: 3, state: 'Lakshadweep' },
  { name: 'Agatti', zone: 3, state: 'Lakshadweep' },
  { name: 'Amini', zone: 3, state: 'Lakshadweep' },
  { name: 'Andrott', zone: 3, state: 'Lakshadweep' },
  { name: 'Bitra', zone: 3, state: 'Lakshadweep' },
  { name: 'Chettat', zone: 3, state: 'Lakshadweep' },
  { name: 'Kadmat', zone: 3, state: 'Lakshadweep' },
  { name: 'Kalpeni', zone: 3, state: 'Lakshadweep' },
  { name: 'Kiltan', zone: 3, state: 'Lakshadweep' },
  { name: 'Minicoy', zone: 3, state: 'Lakshadweep' },
  { name: 'Daman', zone: 3, state: 'Daman and Diu' },
  { name: 'Diu', zone: 3, state: 'Daman and Diu' },
  { name: 'Silvassa', zone: 3, state: 'Dadra and Nagar Haveli' },
  { name: 'Margao', zone: 3, state: 'Goa' },
  { name: 'Mapusa', zone: 3, state: 'Goa' },
  { name: 'Ponda', zone: 3, state: 'Goa' },
];

/**
 * Get zone number from city name (and optionally state for disambiguation)
 * @param cityName - Name of the city
 * @param state - Optional state name for disambiguation (for cities with same name in different states)
 * @returns Zone number (1, 2, or 3), or null if city not found
 */
export function getZoneFromCity(cityName: string, state?: string): 1 | 2 | 3 | null {
  const city = getCityInfo(cityName, state);
  return city ? city.zone : null;
}

/**
 * Get city info by city name (and optionally state for disambiguation)
 * @param cityName - Name of the city
 * @param state - Optional state name for disambiguation (for cities with same name in different states)
 * @returns CityInfo object or null if not found
 */
export function getCityInfo(cityName: string, state?: string): CityInfo | null {
  if (state) {
    return CITY_ZONE_MAPPING.find(
      c => c.name.toLowerCase() === cityName.toLowerCase() && 
           c.state.toLowerCase() === state.toLowerCase()
    ) || null;
  }
  return CITY_ZONE_MAPPING.find(
    c => c.name.toLowerCase() === cityName.toLowerCase()
  ) || null;
}

/**
 * Get all cities in a specific zone
 * @param zone - Zone number (1, 2, or 3)
 * @returns Array of CityInfo objects
 */
export function getCitiesByZone(zone: 1 | 2 | 3): CityInfo[] {
  return CITY_ZONE_MAPPING.filter(city => city.zone === zone);
}

/**
 * Get all cities sorted by zone and name
 * @returns Array of CityInfo objects sorted by zone first, then name
 */
export function getAllCitiesSorted(): CityInfo[] {
  return [...CITY_ZONE_MAPPING].sort((a, b) => {
    if (a.zone !== b.zone) {
      return a.zone - b.zone;
    }
    return a.name.localeCompare(b.name);
  });
}

/**
 * Convert zone number to legacy locality string (for backward compatibility)
 * @param zone - Zone number (1, 2, or 3)
 * @returns Legacy locality string ('metro', 'tier1', or 'tier2')
 */
export function zoneToLegacyLocality(zone: 1 | 2 | 3): 'metro' | 'tier1' | 'tier2' {
  if (zone === 1) return 'metro';
  if (zone === 2) return 'tier1';
  return 'tier2';
}

/**
 * Convert legacy locality string to zone number (for backward compatibility)
 * @param locality - Legacy locality string ('metro', 'tier1', or 'tier2')
 * @returns Zone number (1, 2, or 3)
 */
export function legacyLocalityToZone(locality: 'metro' | 'tier1' | 'tier2'): 1 | 2 | 3 {
  if (locality === 'metro') return 1;
  if (locality === 'tier1') return 2;
  return 3;
}
