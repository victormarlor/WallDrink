import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./PopularFilter.css"

const PopularFilter = ({ label, faIcon, active, onClick }) => {
    return (
        <div className={`popular-filter ${active ? "active" : ""}`} onClick={onClick}>
            <FontAwesomeIcon icon={faIcon} className="filter-icon" />
            <div className="filter-label">{label}</div>
        </div>
    );
};

export default PopularFilter;
