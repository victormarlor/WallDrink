// FilterTag.jsx
import "./FilterTag.css";

const FilterTag = ({ filter, removeFilter }) => {
    return (
        <span className="filter-tag">
            {filter}
            <button onClick={() => removeFilter(filter)} className="remove-button">✕</button>
        </span>
    );
};

export default FilterTag;
