import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import stars from "./starInfo.json";

function speckledStarsBackground(svg) {
  for (let i = 0; i < 150; i++) {
    const cx = Math.random() * window.innerWidth;
    const cy = Math.random() * window.innerHeight;
    const r = Math.random() * 1 + 0.2;
    svg.append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", r)
      .attr("fill", "white")
      .attr("opacity", Math.random() * 0.5 + 0.1);
  }
}

function StarMap() {
  const starTypeOptions = ["M", "G", "K", "A", "L", "T", "Y"];
  const starTypeDescriptions = {
    M: "Red dwarf",
    G: "Sun-like",
    K: "Orange dwarf",
    A: "White star",
    L: "Brown dwarf",
    T: "Methane dwarf",
    Y: "Ultra-cool dwarf",
  };
  const svgRef = useRef();
  const svgSelectionRef = useRef(null);
  const searchResetTimeoutRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFeedback, setSearchFeedback] = useState("");
  const [selectedStarTypes, setSelectedStarTypes] = useState(starTypeOptions);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const width = window.innerWidth;
  const padding = 80;
  const dist = (width / 2 - padding) / 12;
  const height = window.innerHeight;

  const showTooltipForStar = (star, index) => {
    const x = width / 2 + star.distance * dist * Math.cos((index / stars.length) * 2 * Math.PI);
    const y = height / 2 + star.distance * dist * Math.sin((index / stars.length) * 2 * Math.PI) * 0.5;

    d3.select("#tooltip")
      .style("opacity", 1)
      .style("left", `${x + 20}px`)
      .style("top", `${y + 20}px`)
      .html(`<strong>${star.name}</strong><br/>${star.distance} ly<br/>${star.star_type}`);
  };

  const createStars = (svg) => {
    const starGroups = svg.selectAll("g.star")
      .data(stars)
      .join("g")
      .attr("class", "star")
      .attr("transform", (d, i) => {
        const x = width / 2 + d.distance * dist * Math.cos((i / stars.length) * 2 * Math.PI);
        const y = height / 2 + d.distance * dist * Math.sin((i / stars.length) * 2 * Math.PI) * 0.5;
        return `translate(${x}, ${y})`;
      });

    starGroups.append("circle")
      .attr("class", "halo-outer")
      .attr("r", d => d.size * 6)
      .attr("fill", d => d.color)
      .attr("opacity", 0.06);

    starGroups.append("circle")
      .attr("class", "halo-inner")
      .attr("r", d => d.size * 3)
      .attr("fill", d => d.color)
      .attr("opacity", 0.15);

    starGroups.append("circle")
      .attr("class", "core")
      .attr("r", d => d.size)
      .attr("fill", d => d.color)
      .attr("opacity", 1);

    starGroups
      .on("mouseover", function (event, d) {
        const group = d3.select(this);

        group.selectAll("circle").interrupt();

        group.select("circle.halo-outer")
          .transition()
          .duration(220)
          .delay(0)
          .attr("r", d.size * 10)
          .attr("opacity", 0.1);

        group.select("circle.halo-inner")
          .transition()
          .duration(220)
          .delay(90)
          .attr("r", d.size * 5)
          .attr("opacity", 0.2);

        group.select("circle.core")
          .transition()
          .duration(220)
          .delay(180)
          .attr("r", d.size * 2)
          .attr("opacity", 1);

        d3.select("#tooltip")
          .style("opacity", 1)
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY}px`)
          .html(`<strong>${d.name}</strong><br/>${d.distance} ly<br/>${d.star_type}`);
      })
      .on("mouseout", function (event, d) {
        const group = d3.select(this);

        group.selectAll("circle").interrupt();

        group.select("circle.halo-outer")
          .transition()
          .duration(180)
          .delay(0)
          .attr("r", d.size * 6)
          .attr("opacity", 0.06);

        group.select("circle.halo-inner")
          .transition()
          .duration(180)
          .delay(70)
          .attr("r", d.size * 3)
          .attr("opacity", 0.15);

        group.select("circle.core")
          .transition()
          .duration(180)
          .delay(140)
          .attr("r", d.size)
          .attr("opacity", 1);

        d3.select("#tooltip").style("opacity", 0);
      });
  };


  const createDistanceGrid = (svg) => {
    const intervalLy = 3;

    for (let i = 1; i < 5; i++) {
      const lyValue = intervalLy * i;
      const radius = lyValue * dist;
      svg.append("ellipse")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("rx", radius)
        .attr("ry", radius * 0.5)
        .attr("fill", "none")
        .attr("stroke", "#8cb8ff")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5 4")
        .attr("opacity", 0.25);

      svg.append("text")
        .attr("x", width / 2 + radius + 8)
        .attr("y", height / 2 - 4)
        .attr("text-anchor", "start")
        .attr("fill", "#d6e7ff")
        .attr("font-size", "12px")
        .attr("font-family", "Arial, sans-serif")
        .attr("font-weight", 600)
        .attr("stroke", "#0b1222")
        .attr("stroke-width", 2)
        .attr("paint-order", "stroke")
        .attr("opacity", 0.98)
        .text(`${lyValue} ly`);
    }
  };

  const resetAllStars = (svg) => {
    svg.selectAll("g.star").each(function (d) {
      const group = d3.select(this);
      group.select("circle.halo-outer").attr("r", d.size * 6).attr("opacity", 0.06);
      group.select("circle.halo-inner").attr("r", d.size * 3).attr("opacity", 0.15);
      group.select("circle.core").attr("r", d.size).attr("opacity", 1);
    });
  };

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svgSelectionRef.current = svg;
    svg.selectAll("*").remove();
    speckledStarsBackground(svg);
    createDistanceGrid(svg);
    createStars(svg);

    return () => {
      if (searchResetTimeoutRef.current) {
        clearTimeout(searchResetTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const svg = svgSelectionRef.current;
    if (!svg) return;

    const selectedTypesSet = new Set(selectedStarTypes);

    svg.selectAll("g.star")
      .transition()
      .duration(180)
      .style("opacity", (d) => {
        const typeCode = (d.star_type || "").charAt(0).toUpperCase();
        return selectedTypesSet.has(typeCode) ? 1 : 0.14;
      });
  }, [selectedStarTypes]);

  const toggleStarType = (type) => {
    setSelectedStarTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type);
      }

      return [...prev, type];
    });
  };

  const search = () => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setSearchFeedback("");
      return;
    }

    const svg = svgSelectionRef.current;
    if (!svg) return;

    if (searchResetTimeoutRef.current) {
      clearTimeout(searchResetTimeoutRef.current);
      searchResetTimeoutRef.current = null;
    }

    const matchIndex = stars.findIndex((star) => star.name.toLowerCase().includes(term));

    resetAllStars(svg);

    if (matchIndex >= 0) {
      const match = stars[matchIndex];
      const matchedGroup = svg.selectAll("g.star").filter((d) => d.name === match.name);

      matchedGroup.select("circle.halo-outer").transition().duration(250).attr("r", match.size * 12).attr("opacity", 0.12);
      matchedGroup.select("circle.halo-inner").transition().duration(250).attr("r", match.size * 7).attr("opacity", 0.3);
      matchedGroup.select("circle.core").transition().duration(250).attr("r", match.size * 2.2).attr("opacity", 1);

      showTooltipForStar(match, matchIndex);
      setSearchFeedback("");

      searchResetTimeoutRef.current = setTimeout(() => {
        const currentSvg = svgSelectionRef.current;
        if (!currentSvg) return;
        resetAllStars(currentSvg);
        d3.select("#tooltip").style("opacity", 0);
      }, 7000);
    } else {
      d3.select("#tooltip").style("opacity", 0);
      setSearchFeedback("Star not found. Try a different name.");
    }
  };

  const isAllSelected = selectedStarTypes.length === starTypeOptions.length;

  return (
    <div style={{ position: "relative" }}>
      <svg ref={svgRef} width="100%" height="100vh" style={{ background: "#07080f" }} />
      <div id="tooltip" style={{
        position: "absolute",
        opacity: 0,
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "8px 12px",
        borderRadius: "8px",
        pointerEvents: "none",
      }} />

      <label
        htmlFor="search-bar"
        style={{
          position: "absolute",
          top: "1.5%",
          left: "2%",
          color: "#cfd8ea",
          fontSize: "13px",
        }}
      >
      </label>

      <input
        id="search-bar"
        style={{
          position: "absolute",
          top: "4%",
          left: "2%",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "75px",
          padding: "8px 16px",
          color: "white",
          outline: "none",
          fontSize: "14px",
        }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            search();
          }
        }}
        placeholder="Search stars..."
      />

      <button
        type="button"
        onClick={search}
        style={{
          position: "absolute",
          top: "4%",
          left: "15%",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "75px",
          padding: "8px 16px",
          color: "white",
          outline: "none",
          fontSize: "14px",
          cursor: "pointer",
        }}
      >
        Search
      </button>

      {searchFeedback && (
        <div
          style={{
            position: "absolute",
            top: "9%",
            left: "2%",
            color: "#ff9b9b",
            fontSize: "13px",
          }}
        >
          {searchFeedback}
        </div>
      )}
      <div
        style={{
          position: "absolute",
          top: "11.5%",
          left: "2%",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          alignItems: "flex-start",
        }}
      >
        <button
          type="button"
          onClick={() => setIsFilterOpen((prev) => !prev)}
          style={{
            border: "1px solid rgba(133, 166, 255, 0.45)",
            background: "linear-gradient(140deg, rgba(21,28,52,0.9), rgba(8,10,20,0.9))",
            color: "#bfd4ff",
            borderRadius: "999px",
            padding: "6px 11px",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            cursor: "pointer",
            boxShadow: "0 8px 20px rgba(3, 6, 14, 0.35)",
          }}
        >
          {isFilterOpen ? "Hide filter" : "Show filter"}
        </button>

        {isFilterOpen && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              color: "#d8e7ff",
              fontSize: "10px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              background: "linear-gradient(140deg, rgba(21,28,52,0.86), rgba(8,10,20,0.84))",
              border: "1px solid rgba(133, 166, 255, 0.35)",
              borderRadius: "14px",
              padding: "8px",
              boxShadow: "0 12px 35px rgba(3, 6, 14, 0.45)",
              backdropFilter: "blur(3px)",
            }}
          >
            <span style={{ color: "#90b2ff", fontWeight: 600, fontSize: "10px" }}>Star Filter</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: "150px" }}>
              <button
                type="button"
                onClick={() => setSelectedStarTypes(starTypeOptions)}
                style={{
                  border: isAllSelected ? "1px solid rgba(145, 208, 255, 0.9)" : "1px solid rgba(115, 137, 187, 0.45)",
                  background: isAllSelected ? "linear-gradient(120deg, rgba(95, 173, 255, 0.36), rgba(66, 224, 211, 0.3))" : "rgba(17, 24, 44, 0.72)",
                  color: isAllSelected ? "#f0f9ff" : "#bfd4ff",
                  borderRadius: "999px",
                  padding: "5px 10px",
                  width: "100%",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  cursor: "pointer",
                  transition: "all 180ms ease",
                }}
              >
                All
              </button>
              {starTypeOptions.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleStarType(type)}
                  style={{
                    border: selectedStarTypes.includes(type) ? "1px solid rgba(255, 219, 148, 0.95)" : "1px solid rgba(115, 137, 187, 0.45)",
                    background: selectedStarTypes.includes(type) ? "linear-gradient(120deg, rgba(255, 177, 114, 0.34), rgba(255, 99, 99, 0.25))" : "rgba(17, 24, 44, 0.72)",
                    color: selectedStarTypes.includes(type) ? "#fff6ea" : "#bfd4ff",
                    borderRadius: "999px",
                    padding: "5px 9px",
                    width: "100%",
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.02em",
                    cursor: "pointer",
                    transition: "all 180ms ease",
                  }}
                >
                  {type} · {starTypeDescriptions[type]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StarMap